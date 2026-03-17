from fastapi  import APIRouter
from datetime import datetime

from app.models.schemas          import TriggerInput
from app.services.trigger_engine import detect_disruptions, calculate_payout, get_all_thresholds
from app.services.fraud_detector import detect_fraud
from app.services.payout_service import process_payout
from app.utils.database          import (
    get_all_policies, get_worker, create_claim, duplicate_exists
)

router = APIRouter()


@router.post("")
def fire_trigger(body: TriggerInput):
    disruptions = detect_disruptions(body.city, body.temperature, body.rainfall, body.aqi)

    if not disruptions:
        return {
            "triggered":  False,
            "city":       body.city,
            "readings":   {"temperature": body.temperature, "rainfall": body.rainfall, "aqi": body.aqi},
            "message":    "No disruption thresholds breached.",
        }

    city_lower = body.city.strip().lower()
    active_policies = [
        p for p in get_all_policies()
        if p["status"] == "active"
        and get_worker(p["worker_id"]) is not None
        and get_worker(p["worker_id"])["city"] == city_lower
        and p["end_date"] >= datetime.utcnow()
    ]

    all_claims   = []
    total_payout = 0.0

    for disruption in disruptions:
        for policy in active_policies:
            worker = get_worker(policy["worker_id"])

            if duplicate_exists(policy["worker_id"], disruption["trigger_type"]):
                continue

            payout_amount = calculate_payout(policy["coverage_per_event"], disruption["payout_mult"])
            fraud_score, fraud_flags, status = detect_fraud(
                worker_id=policy["worker_id"],
                trigger_type=disruption["trigger_type"],
                amount=payout_amount,
                location=body.city,
            )

            payout_receipt = process_payout(policy["worker_id"], "AUTO", payout_amount) if status == "approved" else None

            claim = create_claim({
                "worker_id":      policy["worker_id"],
                "policy_id":      policy["policy_id"],
                "trigger_type":   disruption["trigger_type"],
                "amount":         payout_amount,
                "status":         status,
                "fraud_score":    fraud_score,
                "fraud_flags":    fraud_flags,
                "location":       body.city,
                "is_auto":        True,
                "payout_receipt": payout_receipt,
            })

            if status == "approved":
                total_payout += payout_amount

            all_claims.append({
                "claim_id":     claim["claim_id"],
                "worker_name":  worker["name"],
                "trigger_type": disruption["trigger_type"],
                "amount":       payout_amount,
                "status":       status,
                "payout":       payout_receipt,
            })

    return {
        "triggered":             True,
        "city":                  body.city,
        "disruptions_detected":  [d["trigger_type"] for d in disruptions],
        "workers_affected":      len(active_policies),
        "claims_created":        len(all_claims),
        "total_payout_inr":      round(total_payout, 2),
        "claims":                all_claims,
    }


@router.get("/thresholds")
def thresholds():
    return get_all_thresholds()
