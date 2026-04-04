from app.services.trigger_engine import detect_disruptions_live
from app.utils.database import get_all_policies, get_worker
from app.services.fraud_detector import detect_fraud
from app.services.payout_service import process_payout
from app.utils.database import create_claim, duplicate_exists
from app.services.trigger_engine import calculate_payout
from app.services.notification_service import notify_claim_filed, notify_claim_approved
from datetime import datetime


def get_unique_cities():
    """Get unique cities from all active policies."""
    policies = get_all_policies()
    cities   = set()
    now      = datetime.utcnow()
    for p in policies:
        if p["status"] == "active" and p["end_date"] >= now:
            worker = get_worker(p["worker_id"])
            if worker:
                cities.add(worker["city"].strip().lower())
    return list(cities)


def auto_process_disruptions_for_city(city: str):
    """Detect disruptions and auto-fire claims for all workers in a city."""
    disruptions, weather_data = detect_disruptions_live(city)

    if not disruptions or weather_data is None:
        return {
            "triggered": False,
            "city":      city,
            "message":   "No disruptions detected or weather fetch failed.",
        }

    city_lower = city.strip().lower()
    now        = datetime.utcnow()

    active_policies = [
        p for p in get_all_policies()
        if p["status"] == "active"
        and p["end_date"] >= now
        and get_worker(p["worker_id"]) is not None
        and get_worker(p["worker_id"])["city"].strip().lower() == city_lower
    ]

    all_claims   = []
    total_payout = 0.0

    for disruption in disruptions:
        for policy in active_policies:
            worker = get_worker(policy["worker_id"])

            if duplicate_exists(policy["worker_id"], disruption["trigger_type"]):
                continue

            payout_amount = calculate_payout(
                policy["coverage_per_event"], disruption["payout_mult"]
            )

            fraud_score, fraud_flags, status = detect_fraud(
                worker_id    = policy["worker_id"],
                trigger_type = disruption["trigger_type"],
                amount       = payout_amount,
                location     = city,
                is_auto      = True,
            )

            payout_receipt = None
            if status == "approved":
                payout_receipt = process_payout(
                    policy["worker_id"], "AUTO", payout_amount
                )

            claim = create_claim({
                "worker_id":     policy["worker_id"],
                "policy_id":     policy["policy_id"],
                "trigger_type":  disruption["trigger_type"],
                "amount":        payout_amount,
                "status":        status,
                "fraud_score":   fraud_score,
                "fraud_flags":   fraud_flags,
                "location":      city,
                "is_auto":       True,
                "payout_receipt": payout_receipt,
            })

            # Send SMS notification
            phone = worker.get("phone", "")
            if phone:
                notify_claim_filed(
                    phone        = phone,
                    worker_name  = worker["name"],
                    trigger_type = disruption["trigger_type"],
                    amount       = payout_amount,
                )
                if status == "approved" and payout_receipt:
                    notify_claim_approved(
                        phone       = phone,
                        worker_name = worker["name"],
                        amount      = payout_amount,
                        receipt     = payout_receipt,
                    )

            if status == "approved":
                total_payout += payout_amount

            all_claims.append({
                "claim_id":    claim["claim_id"],
                "worker_name": worker["name"],
                "trigger_type": disruption["trigger_type"],
                "amount":      payout_amount,
                "status":      status,
                "payout":      payout_receipt,
            })

    return {
        "triggered":            True,
        "city":                 city,
        "weather":              weather_data,
        "disruptions_detected": [d["trigger_type"] for d in disruptions],
        "workers_affected":     len(active_policies),
        "claims_created":       len(all_claims),
        "total_payout_inr":     round(total_payout, 2),
        "claims":               all_claims,
    }


def run_auto_claims():
    """Scheduled job — runs for ALL active cities automatically."""
    cities  = get_unique_cities()
    results = []
    print(f"[AutoClaims] Checking {len(cities)} cities: {cities}")
    for city in cities:
        result = auto_process_disruptions_for_city(city)
        if result["triggered"]:
            print(f"[AutoClaims] {city}: {result['claims_created']} claims, ₹{result['total_payout_inr']} payout")
            results.append(result)
    return results
