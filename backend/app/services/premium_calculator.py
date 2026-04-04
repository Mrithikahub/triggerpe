from app.services.risk_engine import (
    compute_risk_score, risk_label, compute_weekly_premium,
    get_risk_zone, get_weather, PLATFORM_RISK
)


def calculate_premium(worker: dict) -> dict:
    city     = worker["city"]
    platform = worker["platform"]
    earning  = worker.get("avg_daily_earning", 500.0)

    score    = compute_risk_score(city, platform, earning)
    level    = risk_label(score)
    premium  = compute_weekly_premium(score, city, earning)

    # Coverage = 80% of daily earning, min ₹200, max ₹800 per event
    coverage = round(max(200.0, min(earning * 0.80, 800.0)), 2)

    weather   = get_weather(city)
    temp      = weather.get("temperature", 30)
    humidity  = weather.get("humidity", 60)
    wind      = weather.get("wind_speed", weather.get("wind", 10))
    condition = weather.get("condition", "Clear")
    rainfall  = weather.get("rainfall", 0)
    aqi       = weather.get("aqi", 100)

    # Disruption probability from live weather
    disp_prob = 0.0
    if condition in ["Rain", "Thunderstorm", "Heavy Rain", "Moderate rain"]: disp_prob += 0.40
    if rainfall  > 20:  disp_prob += 0.20
    if rainfall  > 50:  disp_prob += 0.30
    if wind      > 30:  disp_prob += 0.15
    if wind      > 45:  disp_prob += 0.20
    if humidity  > 80:  disp_prob += 0.10
    if temp      > 42:  disp_prob += 0.30
    if aqi       > 200: disp_prob += 0.20
    if aqi       > 300: disp_prob += 0.20
    disp_prob = round(min(disp_prob, 0.99), 2)

    zone = get_risk_zone(city)
    plat_loading = PLATFORM_RISK.get(platform, 0.03) * 100  # as INR

    return {
        "worker_id":              worker["worker_id"],
        "risk_level":             level,
        "risk_score":             score,
        "risk_zone":              zone,
        "disruption_probability": disp_prob,
        "weekly_premium":         premium,
        "coverage_per_event":     coverage,
        "monthly_estimate":       round(premium * 4, 2),
        "breakdown": {
            "base_rate":           30,
            "zone_surcharge":      {"low": 0, "medium": 15, "high": 25}[zone],
            "platform_loading":    round(plat_loading, 2),
            "disruption_loading":  round(disp_prob * 30, 2),
            "risk_loading":        round(score * 20, 2),
        },
        "live_weather": {
            "temperature": temp,
            "rainfall":    rainfall,
            "aqi":         aqi,
            "condition":   condition,
        },
    }
