import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("WEATHER_API_KEY")

THRESHOLDS = {
    "HEAVY_RAIN":   {"field": "rainfall",    "value": 50,  "payout_mult": 1.00},
    "EXTREME_HEAT": {"field": "temperature", "value": 42,  "payout_mult": 0.75},
    "HIGH_AQI":     {"field": "aqi",         "value": 300, "payout_mult": 0.75},
}


def fetch_live_weather(city: str) -> dict | None:
    """Fetch real-time weather from WeatherAPI.com"""
    if not API_KEY:
        print("⚠️ No WEATHER_API_KEY found in .env")
        return None
    try:
        # No aqi=yes — that's a paid WeatherAPI feature
        url = f"http://api.weatherapi.com/v1/current.json?key={API_KEY}&q={city}"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        cur = data["current"]

        # Estimate AQI from humidity + condition (free tier workaround)
        humidity = cur.get("humidity", 60)
        condition_text = cur["condition"]["text"].lower()
        aqi_estimate = 50  # baseline
        if humidity > 80: aqi_estimate += 80
        if "smog" in condition_text or "fog" in condition_text: aqi_estimate += 150
        if "haze" in condition_text: aqi_estimate += 100
        if "dust" in condition_text: aqi_estimate += 200

        return {
            "temperature": cur["temp_c"],
            "rainfall":    cur.get("precip_mm", 0),
            "aqi":         aqi_estimate,
            "humidity":    humidity,
            "wind_speed":  cur["wind_kph"],
            "condition":   cur["condition"]["text"],
            "source":      "live",
        }
    except Exception as e:
        print(f"[TriggerEngine] WeatherAPI error for {city}: {e}")
        return None


def detect_disruptions(city: str, temperature: float, rainfall: float, aqi: float) -> list:
    """Detect disruptions from weather values (used for manual trigger)."""
    readings = {"rainfall": rainfall, "temperature": temperature, "aqi": aqi}
    triggered = []
    for trigger_type, rule in THRESHOLDS.items():
        if readings[rule["field"]] >= rule["value"]:
            triggered.append({
                "trigger_type": trigger_type,
                "reading":      readings[rule["field"]],
                "threshold":    rule["value"],
                "payout_mult":  rule["payout_mult"],
                "city":         city.lower(),
            })
    return triggered


def detect_disruptions_live(city: str):
    """
    Fetch live weather then detect disruptions.
    Returns (disruptions_list, weather_dict | None)
    """
    weather = fetch_live_weather(city)
    if not weather:
        return [], None
    disruptions = detect_disruptions(
        city=city,
        temperature=weather["temperature"],
        rainfall=weather["rainfall"],
        aqi=weather["aqi"],
    )
    return disruptions, weather


def calculate_payout(coverage: float, payout_mult: float) -> float:
    return round(coverage * payout_mult, 2)


def get_all_thresholds() -> dict:
    return THRESHOLDS
