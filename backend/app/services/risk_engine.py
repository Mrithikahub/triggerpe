import os
import pickle

CITY_RISK = {
    "mumbai": "high", "chennai": "high", "delhi": "high", "kolkata": "high",
    "bangalore": "medium", "hyderabad": "medium", "pune": "medium", "ahmedabad": "medium",
}

CITY_DISRUPTION_PROB = {
    "mumbai": 0.75, "delhi": 0.70, "chennai": 0.65, "kolkata": 0.65,
    "bangalore": 0.45, "hyderabad": 0.45, "pune": 0.40, "ahmedabad": 0.35,
}


def get_risk_zone(city: str) -> str:
    return CITY_RISK.get(city.strip().lower(), "low")


def get_disruption_probability(city: str) -> float:
    return CITY_DISRUPTION_PROB.get(city.strip().lower(), 0.25)


def compute_risk_score(city: str, platform: str, avg_daily_earning: float) -> float:
    model_path = "app/ai_models/risk_model.pkl"
    if os.path.exists(model_path):
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        return float(model.predict([[city, platform, avg_daily_earning]])[0])

    score = 0.20
    c = city.strip().lower()
    if c in ("mumbai", "chennai", "delhi", "kolkata"):      score += 0.30
    elif c in ("bangalore", "hyderabad", "pune", "ahmedabad"): score += 0.15
    score += get_disruption_probability(c) * 0.20
    if avg_daily_earning < 400:   score += 0.10
    elif avg_daily_earning < 600: score += 0.05
    if platform.lower() == "swiggy": score += 0.05
    return round(min(score, 1.0), 2)


def risk_label(score: float) -> str:
    if score >= 0.65: return "high"
    if score >= 0.35: return "medium"
    return "low"


def compute_weekly_premium(score: float, city: str, avg_daily_earning: float) -> float:
    zone = get_risk_zone(city)
    surcharge = {"low": 0, "medium": 15, "high": 25}[zone]
    premium = 30 + surcharge + (get_disruption_probability(city) * 30) + (score * 20)
    return round(premium, 2)
