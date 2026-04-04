import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("WEATHER_API_KEY")

# Expanded city risk zones — 12 cities (Phase 2)
CITY_RISK = {
    # HIGH — coastal/flood-prone/extreme heat
    "mumbai":    "high",
    "chennai":   "high",
    "delhi":     "high",
    "kolkata":   "high",
    # MEDIUM — moderate disruption history
    "bangalore": "medium",
    "hyderabad": "medium",
    "pune":      "medium",
    "ahmedabad": "medium",
    "surat":     "medium",
    "nagpur":    "medium",
    # LOW — relatively stable
    "jaipur":    "low",
    "lucknow":   "low",
}

# Platform risk factors — food delivery most weather-sensitive
PLATFORM_RISK = {
    "Swiggy":   0.05,   # food delivery — highly rain-sensitive
    "Zomato":   0.05,
    "Zepto":    0.04,   # q-commerce — time-critical
    "Blinkit":  0.04,
    "Amazon":   0.02,   # e-commerce — less time-sensitive
    "Flipkart": 0.02,
}

# Hyper-local zone loading per city
ZONE_SURCHARGE = {"low": 0, "medium": 15, "high": 25}


def get_weather(city: str) -> dict:
    if not API_KEY:
        return _fallback(city)
    try:
        url = f"http://api.weatherapi.com/v1/current.json?key={API_KEY}&q={city}"
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        data = r.json()
        cur  = data["current"]

        humidity       = cur.get("humidity", 60)
        condition_text = cur["condition"]["text"].lower()
        wind_kph       = cur.get("wind_kph", 0)

        aqi = 50
        if humidity > 80:                                         aqi += 80
        if "smog" in condition_text or "fog" in condition_text:  aqi += 150
        if "haze" in condition_text:                             aqi += 100
        if "dust" in condition_text or "sand" in condition_text: aqi += 200

        print(f"[RiskEngine] Live weather for {city}: {cur['temp_c']}C")
        return {
            "temperature":   cur["temp_c"],
            "rainfall":      cur.get("precip_mm", 0),
            "aqi":           aqi,
            "humidity":      humidity,
            "wind_speed":    wind_kph,
            "wind":          wind_kph,
            "condition":     cur["condition"]["text"],
            "traffic_index": 60,
        }
    except Exception as e:
        print(f"[RiskEngine] WeatherAPI error for {city}: {e}")
        return _fallback(city)


def _fallback(city: str) -> dict:
    STATIC = {
        "mumbai":    {"temperature": 32, "rainfall": 10, "aqi": 150, "humidity": 80, "wind_speed": 15, "wind": 15, "condition": "Partly Cloudy", "traffic_index": 80},
        "delhi":     {"temperature": 38, "rainfall": 0,  "aqi": 300, "humidity": 50, "wind_speed": 10, "wind": 10, "condition": "Haze",          "traffic_index": 85},
        "chennai":   {"temperature": 34, "rainfall": 5,  "aqi": 120, "humidity": 75, "wind_speed": 20, "wind": 20, "condition": "Partly Cloudy", "traffic_index": 70},
        "bangalore": {"temperature": 28, "rainfall": 2,  "aqi": 100, "humidity": 65, "wind_speed": 12, "wind": 12, "condition": "Clear",         "traffic_index": 75},
        "hyderabad": {"temperature": 35, "rainfall": 0,  "aqi": 130, "humidity": 55, "wind_speed": 10, "wind": 10, "condition": "Clear",         "traffic_index": 65},
        "kolkata":   {"temperature": 33, "rainfall": 8,  "aqi": 180, "humidity": 85, "wind_speed": 18, "wind": 18, "condition": "Cloudy",        "traffic_index": 70},
        "pune":      {"temperature": 30, "rainfall": 2,  "aqi": 90,  "humidity": 60, "wind_speed": 10, "wind": 10, "condition": "Clear",         "traffic_index": 60},
        "ahmedabad": {"temperature": 37, "rainfall": 0,  "aqi": 160, "humidity": 45, "wind_speed": 12, "wind": 12, "condition": "Sunny",         "traffic_index": 65},
        "surat":     {"temperature": 34, "rainfall": 3,  "aqi": 140, "humidity": 70, "wind_speed": 15, "wind": 15, "condition": "Partly Cloudy", "traffic_index": 60},
        "nagpur":    {"temperature": 40, "rainfall": 0,  "aqi": 110, "humidity": 40, "wind_speed": 8,  "wind": 8,  "condition": "Sunny",         "traffic_index": 55},
        "jaipur":    {"temperature": 36, "rainfall": 0,  "aqi": 130, "humidity": 35, "wind_speed": 10, "wind": 10, "condition": "Clear",         "traffic_index": 60},
        "lucknow":   {"temperature": 34, "rainfall": 2,  "aqi": 190, "humidity": 55, "wind_speed": 8,  "wind": 8,  "condition": "Haze",          "traffic_index": 65},
    }
    return STATIC.get(city.strip().lower(), {
        "temperature": 30, "rainfall": 0, "aqi": 100,
        "humidity": 60, "wind_speed": 10, "wind": 10,
        "condition": "Clear", "traffic_index": 60,
    })


def compute_risk_score(city: str, platform: str, avg_daily_earning: float) -> float:
    weather = get_weather(city)

    rain_factor  = min(weather["rainfall"] / 100, 1.0)
    aqi_factor   = min(weather["aqi"] / 500, 1.0)
    temp_factor  = max((weather["temperature"] - 30) / 20, 0)
    wind_factor  = min(weather.get("wind_speed", 0) / 60, 1.0)
    zone         = get_risk_zone(city)
    zone_factor  = {"low": 0.0, "medium": 0.08, "high": 0.15}[zone]
    plat_factor  = PLATFORM_RISK.get(platform, 0.03)

    score = (
        rain_factor  * 0.35 +
        aqi_factor   * 0.25 +
        temp_factor  * 0.20 +
        wind_factor  * 0.10 +
        zone_factor  +
        plat_factor
    )

    # Low earners → higher vulnerability
    if avg_daily_earning < 400:
        score += 0.05

    return round(min(score, 1.0), 2)


def risk_label(score: float) -> str:
    if score >= 0.65: return "high"
    if score >= 0.35: return "medium"
    return "low"


def get_risk_zone(city: str) -> str:
    return CITY_RISK.get(city.strip().lower(), "low")


def compute_weekly_premium(score: float, city: str, avg_daily_earning: float) -> float:
    zone      = get_risk_zone(city)
    surcharge = ZONE_SURCHARGE[zone]
    # Base ₹30 + zone surcharge + risk loading + disruption loading
    premium   = 30 + surcharge + (score * 20) + (score * 30)
    # Minimum ₹29, maximum ₹150
    return round(max(29.0, min(premium, 150.0)), 2)
