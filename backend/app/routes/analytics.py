from fastapi  import APIRouter
from datetime import datetime, timedelta
from app.utils.database import get_all_workers, get_all_claims, get_all_policies

router = APIRouter()


@router.get("")
def get_analytics():
    workers  = get_all_workers()
    claims   = get_all_claims()
    policies = get_all_policies()

    approved = [c for c in claims if c["status"] == "approved"]
    review   = [c for c in claims if c["status"] == "review"]
    rejected = [c for c in claims if c["status"] == "rejected"]
    fraud_flagged = [c for c in claims if c["fraud_score"] >= 0.35]

    recent_auto = [
        c for c in claims
        if c.get("is_auto") and c["created_at"] >= datetime.utcnow() - timedelta(hours=24)
    ]
    active_disruptions = list(set(c["trigger_type"] for c in recent_auto))

    total_payout  = sum(c["amount"] for c in approved)
    total_premium = sum(p["total_premium"] for p in policies)

    return {
        "total_workers":      len(workers),
        "total_claims":       len(claims),
        "fraud_alerts":       len(fraud_flagged),
        "active_disruptions": active_disruptions,
        "policies": {
            "total":             len(policies),
            "active":            sum(1 for p in policies if p["status"] == "active"),
            "premium_collected": round(total_premium, 2),
        },
        "claims": {
            "approved":       len(approved),
            "review":         len(review),
            "rejected":       len(rejected),
            "auto_triggered": len([c for c in claims if c.get("is_auto")]),
            "total_payout":   round(total_payout, 2),
        },
        "fraud": {
            "flagged":     len(fraud_flagged),
            "rejected":    len(rejected),
            "fraud_rate":  round(len(fraud_flagged) / max(len(claims), 1) * 100, 2),
        },
        "financials": {
            "premium_in":   round(total_premium, 2),
            "payouts_out":  round(total_payout, 2),
            "net_position": round(total_premium - total_payout, 2),
        },
    }
