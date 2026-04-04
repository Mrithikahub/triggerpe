import os
import joblib
import pandas as pd
from datetime import datetime, timedelta

REJECT_THRESHOLD = float(os.getenv("FRAUD_REJECT_THRESHOLD", 0.65))
REVIEW_THRESHOLD = float(os.getenv("FRAUD_REVIEW_THRESHOLD", 0.35))

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "ai_models", "fraud_model.pkl")
_model = None

try:
    from sklearn.ensemble import RandomForestClassifier
except ImportError:
    class RandomForestClassifier:
        pass

# GPS city bounds (lat_min, lat_max, lng_min, lng_max)
CITY_BOUNDS = {
    "mumbai":    (18.85, 19.35, 72.75, 73.05),
    "delhi":     (28.40, 28.90, 76.85, 77.40),
    "chennai":   (12.85, 13.25, 80.10, 80.35),
    "bangalore": (12.80, 13.15, 77.45, 77.80),
    "hyderabad": (17.25, 17.65, 78.25, 78.65),
    "kolkata":   (22.40, 22.70, 88.20, 88.50),
    "pune":      (18.40, 18.65, 73.75, 74.05),
    "ahmedabad": (22.90, 23.15, 72.45, 72.75),
    "jaipur":    (26.75, 27.05, 75.65, 76.00),
    "surat":     (21.10, 21.35, 72.75, 73.05),
    "lucknow":   (26.75, 27.05, 80.85, 81.10),
    "nagpur":    (21.05, 21.30, 79.00, 79.25),
}


def _gps_valid(city: str, lat: float, lng: float) -> bool:
    bounds = CITY_BOUNDS.get(city.strip().lower())
    if not bounds:
        return True
    return bounds[0] <= lat <= bounds[1] and bounds[2] <= lng <= bounds[3]


def _load_model():
    global _model
    if _model is None:
        try:
            if os.path.exists(MODEL_PATH):
                _model = joblib.load(MODEL_PATH)
                print(f"Fraud model loaded: {MODEL_PATH}")
        except Exception as e:
            print(f"Failed to load fraud model: {e}")
            _model = None
    return _model


def _weather_validates_claim(city: str, trigger_type: str) -> bool:
    """Cross-validate: check if live weather actually supports the claimed trigger."""
    try:
        from app.services.trigger_engine import fetch_live_weather, THRESHOLDS
        weather = fetch_live_weather(city)
        if not weather:
            return True  # can't verify — give benefit of doubt

        rule = THRESHOLDS.get(trigger_type)
        if not rule:
            return True  # social disruption — cannot auto-verify

        field_map = {
            "rainfall":    weather.get("rainfall", 0),
            "temperature": weather.get("temperature", 30),
            "aqi":         weather.get("aqi", 50),
            "wind_speed":  weather.get("wind_speed", 0),
        }
        actual = field_map.get(rule["field"], 0)
        # Allow 70% grace margin (weather may have slightly eased)
        return actual >= (rule["value"] * 0.7)
    except Exception:
        return True


def detect_fraud(
    worker_id: str,
    trigger_type: str,
    amount: float,
    location: str,
    gps_lat: float = None,
    gps_lng: float = None,
    is_auto: bool = False,
):
    from app.utils.database import get_worker_claims, duplicate_exists

    score = 0.0
    flags = []

    all_claims  = get_worker_claims(worker_id)
    now         = datetime.utcnow()
    recent_7d   = [c for c in all_claims if c["created_at"] >= now - timedelta(days=7)]
    recent_1h   = [c for c in all_claims if c["created_at"] >= now - timedelta(hours=1)]
    past_claims = len(all_claims)
    claim_freq  = len(recent_7d)
    avg_claim   = sum(c["amount"] for c in all_claims) / max(len(all_claims), 1)
    days_since  = (now - all_claims[-1]["created_at"]).days if all_claims else 999

    # Rule 1 — Duplicate claim today
    if duplicate_exists(worker_id, trigger_type):
        score += 0.50
        flags.append("DUPLICATE_CLAIM_TODAY")

    # Rule 2 — High frequency in 7 days
    if claim_freq >= 4:
        score += 0.25
        flags.append(f"HIGH_FREQUENCY_{claim_freq}_IN_7D")

    # Rule 3 — Velocity spike: multiple claims in 1 hour
    if len(recent_1h) >= 2:
        score += 0.30
        flags.append(f"VELOCITY_SPIKE_{len(recent_1h)}_IN_1H")

    # Rule 4 — GPS validation
    if gps_lat and gps_lng:
        if not _gps_valid(location, gps_lat, gps_lng):
            score += 0.40
            flags.append("GPS_LOCATION_MISMATCH")
    elif not is_auto:
        score += 0.10
        flags.append("NO_GPS")

    # Rule 5 — Abnormal amount
    if amount > 500:
        score += 0.20
        flags.append("ABNORMAL_AMOUNT")

    # Rule 6 — Weather cross-validation (manual claims only)
    if not is_auto:
        if not _weather_validates_claim(location, trigger_type):
            score += 0.45
            flags.append("WEATHER_NOT_VERIFIED")

    # Rule 7 — Amount deviation from personal history
    if past_claims >= 3 and avg_claim > 0:
        if abs(amount - avg_claim) / avg_claim > 0.5:
            score += 0.15
            flags.append("AMOUNT_DEVIATION_HIGH")

    # ML model
    model = _load_model()
    if model:
        try:
            input_df = pd.DataFrame([{
                "claim_amount":     amount,
                "risk_score":       0.5,
                "disruption_count": claim_freq,
                "past_claims":      past_claims,
                "avg_claim":        avg_claim,
                "days_since":       days_since,
                "velocity_1h":      len(recent_1h),
                "has_gps":          1 if gps_lat else 0,
                "is_auto":          1 if is_auto else 0,
                "amount_deviation": abs(amount - avg_claim) / max(avg_claim, 1),
            }])
            pred = model.predict(input_df)[0]
            if pred == 1:
                score = min(score + 0.40, 1.0)
                flags.append("ML_FRAUD_DETECTED")
        except Exception as e:
            print(f"ML prediction error: {e}")

    score  = round(min(score, 1.0), 2)
    status = "rejected" if score >= REJECT_THRESHOLD else "review" if score >= REVIEW_THRESHOLD else "approved"
    return score, flags, status
