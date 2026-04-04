import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("WEATHER_API_KEY")

# ── 5 Parametric Triggers (Phase 2) ─────────────────────────────────────────
THRESHOLDS = {
    "HEAVY_RAIN": {
        "field": "rainfall", "value": 50, "payout_mult": 1.00,
        "description": "Rainfall >= 50mm — deliveries halted",
    },
    "EXTREME_HEAT": {
        "field": "temperature", "value": 42, "payout_mult": 0.75,
        "description": "Temperature >= 42C — outdoor work dangerous",
    },
    "HIGH_AQI": {
        "field": "aqi", "value": 300, "payout_mult": 0.75,
        "description": "AQI >= 300 — severe pollution, work unsafe",
    },
    "STRONG_WIND": {
        "field": "wind_speed", "value": 45, "payout_mult": 0.60,
        "description": "Wind >= 45 km/h — two-wheeler deliveries dangerous",
    },
    "FLOOD_ALERT": {
        "field": "rainfall", "value": 100, "payout_mult": 1.00,
        "description": "Rainfall >= 100mm — flooding, city shutdown",
    },
}

SOCIAL_DISRUPTIONS = {
    "CURFEW":  {"payout_mult": 1.00, "description": "Government curfew — zero deliveries possible"},
    "STRIKE":  {"payout_mult": 0.80, "description": "City-wide strike — partial delivery halt"},
    "PROTEST": {"payout_mult": 0.60, "description": "Local protest — zone access restricted"},
}


def fetch_live_weather(city: str) -> dict | None:
    if not API_KEY:
        print("No WEATHER_API_KEY in .env")
        return None
    try:
        url = f"http://api.weatherapi.com/v1/current.json?key={API_KEY}&q={city}"
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        data = r.json()
        cur  = data["current"]

        humidity       = cur.get("humidity", 60)
        condition_text = cur["condition"]["text"].lower()
        wind_kph       = cur.get("wind_kph", 0)

        # AQI estimate from free-tier data
        aqi = 50
        if humidity > 80:                                         aqi += 80
        if "smog" in condition_text or "fog" in condition_text:  aqi += 150
        if "haze" in condition_text:                             aqi += 100
        if "dust" in condition_text or "sand" in condition_text: aqi += 200
        if "thunder" in condition_text:                          aqi += 40

        print(f"[Weather] {city}: {cur['temp_c']}C | {cur.get('precip_mm',0)}mm rain | wind {wind_kph}km/h | AQI~{aqi}")

        return {
            "temperature": cur["temp_c"],
            "rainfall":    cur.get("precip_mm", 0),
            "aqi":         aqi,
            "humidity":    humidity,
            "wind_speed":  wind_kph,
            "condition":   cur["condition"]["text"],
            "source":      "live",
        }
    except Exception as e:
        print(f"[TriggerEngine] WeatherAPI error for {city}: {e}")
        return None


def detect_disruptions(city: str, temperature: float, rainfall: float, aqi: float, wind_speed: float = 0) -> list:
    readings = {
        "rainfall":    rainfall,
        "temperature": temperature,
        "aqi":         aqi,
        "wind_speed":  wind_speed,
    }
    triggered = []
    for trigger_type, rule in THRESHOLDS.items():
        val = readings.get(rule["field"], 0)
        if val >= rule["value"]:
            triggered.append({
                "trigger_type": trigger_type,
                "reading":      val,
                "threshold":    rule["value"],
                "payout_mult":  rule["payout_mult"],
                "description":  rule["description"],
                "city":         city.lower(),
            })
    return triggered


def detect_disruptions_live(city: str):
    weather = fetch_live_weather(city)
    if not weather:
        return [], None
    disruptions = detect_disruptions(
        city=city,
        temperature=weather["temperature"],
        rainfall=weather["rainfall"],
        aqi=weather["aqi"],
        wind_speed=weather.get("wind_speed", 0),
    )
    return disruptions, weather


def calculate_payout(coverage: float, payout_mult: float) -> float:
    return round(coverage * payout_mult, 2)


def get_all_thresholds() -> dict:
    return {**THRESHOLDS, **{k: {**v, "field": "social"} for k, v in SOCIAL_DISRUPTIONS.items()}}
