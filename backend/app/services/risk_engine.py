import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("WEATHER_API_KEY")

CITY_RISK = {
    "mumbai": "high", "chennai": "high", "delhi": "high", "kolkata": "high",
    "bangalore": "medium", "hyderabad": "medium", "pune": "medium", "ahmedabad": "medium",
}

def get_weather(city: str) -> dict:
    """Fetch real weather from WeatherAPI.com (free tier, no aqi=yes)"""
    if not API_KEY:
        print("⚠️ No WEATHER_API_KEY in .env, using fallback")
        return _fallback(city)

    try:
        url = f"http://api.weatherapi.com/v1/current.json?key={API_KEY}&q={city}"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        cur = data["current"]

        humidity = cur.get("humidity", 60)
        condition_text = cur["condition"]["text"].lower()

        # Estimate AQI from conditions (free tier workaround)
        aqi_estimate = 50
        if humidity > 80: aqi_estimate += 80
        if "smog" in condition_text or "fog" in condition_text: aqi_estimate += 150
        if "haze" in condition_text: aqi_estimate += 100
        if "dust" in condition_text: aqi_estimate += 200

        print(f"✅ Live weather fetched for {city}: {cur['temp_c']}°C, {cur.get('precip_mm',0)}mm rain")
        return {
            "temperature":   cur["temp_c"],
            "rainfall":      cur.get("precip_mm", 0),
            "aqi":           aqi_estimate,
            "humidity":      humidity,
            "wind_speed":    cur["wind_kph"],
            "wind":          cur["wind_kph"],
            "condition":     cur["condition"]["text"],
            "traffic_index": 60,
        }
    except Exception as e:
        print(f"⚠️ WeatherAPI error for {city}: {e}, using fallback")
        return _fallback(city)


def _fallback(city: str) -> dict:
    """Static fallback data when API unavailable"""
    STATIC = {
        "mumbai":    {"temperature": 32, "rainfall": 10, "aqi": 150, "humidity": 80, "wind_speed": 15, "wind": 15, "condition": "Partly Cloudy", "traffic_index": 80},
        "delhi":     {"temperature": 38, "rainfall": 0,  "aqi": 300, "humidity": 50, "wind_speed": 10, "wind": 10, "condition": "Haze",          "traffic_index": 85},
        "chennai":   {"temperature": 34, "rainfall": 5,  "aqi": 120, "humidity": 75, "wind_speed": 20, "wind": 20, "condition": "Partly Cloudy", "traffic_index": 70},
        "bangalore": {"temperature": 28, "rainfall": 2,  "aqi": 100, "humidity": 65, "wind_speed": 12, "wind": 12, "condition": "Clear",         "traffic_index": 75},
        "hyderabad": {"temperature": 35, "rainfall": 0,  "aqi": 130, "humidity": 55, "wind_speed": 10, "wind": 10, "condition": "Clear",         "traffic_index": 65},
        "kolkata":   {"temperature": 33, "rainfall": 8,  "aqi": 180, "humidity": 85, "wind_speed": 18, "wind": 18, "condition": "Cloudy",        "traffic_index": 70},
        "pune":      {"temperature": 30, "rainfall": 2,  "aqi": 90,  "humidity": 60, "wind_speed": 10, "wind": 10, "condition": "Clear",         "traffic_index": 60},
    }
    return STATIC.get(city.strip().lower(), {
        "temperature": 30, "rainfall": 0, "aqi": 100,
        "humidity": 60, "wind_speed": 10, "wind": 10,
        "condition": "Clear", "traffic_index": 60,
    })


def compute_risk_score(city: str, platform: str, avg_daily_earning: float) -> float:
    weather = get_weather(city)
    rain_factor = min(weather["rainfall"] / 100, 1.0)
    aqi_factor  = min(weather["aqi"] / 500, 1.0)
    temp_factor = max((weather["temperature"] - 30) / 20, 0)
    score = (rain_factor * 0.4) + (aqi_factor * 0.3) + (temp_factor * 0.3)
    if avg_daily_earning < 400: score += 0.05
    if platform.lower() == "swiggy": score += 0.02
    return round(min(score, 1.0), 2)


def risk_label(score: float) -> str:
    if score >= 0.65: return "high"
    if score >= 0.35: return "medium"
    return "low"


def get_risk_zone(city: str) -> str:
    return CITY_RISK.get(city.strip().lower(), "low")


def compute_weekly_premium(score: float, city: str, avg_daily_earning: float) -> float:
    zone      = get_risk_zone(city)
    surcharge = {"low": 0, "medium": 15, "high": 25}[zone]
    premium   = 30 + surcharge + (score * 20) + (score * 30)
    return round(premium, 2)
