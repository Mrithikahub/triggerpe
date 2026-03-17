import os
import pickle
from datetime import datetime, timedelta

REJECT_THRESHOLD = 0.65
REVIEW_THRESHOLD = 0.35

CITY_BOUNDS = {
    "mumbai":    (18.85, 19.35, 72.75, 73.05),
    "delhi":     (28.40, 28.90, 76.85, 77.40),
    "chennai":   (12.85, 13.25, 80.10, 80.35),
    "bangalore": (12.80, 13.15, 77.45, 77.80),
    "hyderabad": (17.25, 17.65, 78.25, 78.65),
    "kolkata":   (22.40, 22.70, 88.20, 88.50),
    "pune":      (18.40, 18.65, 73.75, 74.05),
}


def _gps_valid(city: str, lat: float, lng: float) -> bool:
    bounds = CITY_BOUNDS.get(city.lower())
    if not bounds:
        return True
    lat_min, lat_max, lng_min, lng_max = bounds
    return lat_min <= lat <= lat_max and lng_min <= lng <= lng_max


def detect_fraud(
    worker_id: str,
    trigger_type: str,
    amount: float,
    location: str,
    gps_lat: float = None,
    gps_lng: float = None,
) -> tuple:
    model_path = "app/ai_models/fraud_model.pkl"
    if os.path.exists(model_path):
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        score = float(model.predict([[worker_id, trigger_type, amount]])[0])
        flags = ["ML_MODEL_SCORED"]
        status = "rejected" if score >= REJECT_THRESHOLD else "review" if score >= REVIEW_THRESHOLD else "approved"
        return round(score, 2), flags, status

    from app.utils.database import get_worker_claims, duplicate_exists

    score = 0.0
    flags = []

    if duplicate_exists(worker_id, trigger_type):
        score += 0.50
        flags.append("DUPLICATE_CLAIM_TODAY")

    all_claims = get_worker_claims(worker_id)
    recent = [c for c in all_claims if c["created_at"] >= datetime.utcnow() - timedelta(days=7)]
    if len(recent) >= 4:
        score += 0.25
        flags.append(f"HIGH_FREQUENCY_{len(recent)}_CLAIMS_7D")

    if gps_lat and gps_lng:
        if not _gps_valid(location, gps_lat, gps_lng):
            score += 0.40
            flags.append("LOCATION_MISMATCH")
    else:
        score += 0.10
        flags.append("NO_GPS")

    if amount > 500:
        score += 0.20
        flags.append("ABNORMAL_AMOUNT")

    if len(set(c["trigger_type"] for c in recent)) >= 3:
        score += 0.15
        flags.append("MULTI_TRIGGER_STACKING")

    score  = round(min(score, 1.0), 2)
    status = "rejected" if score >= REJECT_THRESHOLD else "review" if score >= REVIEW_THRESHOLD else "approved"
    return score, flags, status
