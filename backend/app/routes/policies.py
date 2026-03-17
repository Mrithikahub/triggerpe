from fastapi  import APIRouter, HTTPException
from datetime import datetime, timedelta

from app.models.schemas              import PolicyCreate
from app.services.premium_calculator import calculate_premium
from app.utils.database              import (
    create_policy, get_worker, get_worker_policies, get_active_policy
)

router = APIRouter()


@router.post("/create", status_code=201)
def create_insurance_policy(body: PolicyCreate):
    worker = get_worker(body.worker_id)
    if not worker:
        raise HTTPException(404, "Worker not found")

    existing = get_active_policy(body.worker_id)
    if existing:
        raise HTTPException(409, f"Active policy {existing['policy_id']} already exists")

    data    = calculate_premium(worker)
    now     = datetime.utcnow()
    policy  = create_policy({
        "worker_id":          body.worker_id,
        "weeks":              body.weeks,
        "weekly_premium":     data["weekly_premium"],
        "total_premium":      round(data["weekly_premium"] * body.weeks, 2),
        "coverage_per_event": data["coverage_per_event"],
        "risk_level":         data["risk_level"],
        "start_date":         now,
        "end_date":           now + timedelta(weeks=body.weeks),
        "status":             "active",
    })

    return {
        "policy_id":          policy["policy_id"],
        "worker_id":          body.worker_id,
        "weekly_premium":     policy["weekly_premium"],
        "total_charged":      policy["total_premium"],
        "coverage_per_event": policy["coverage_per_event"],
        "valid_until":        policy["end_date"].strftime("%Y-%m-%d"),
        "status":             "active",
    }


@router.get("/{worker_id}")
def get_policies(worker_id: str):
    if not get_worker(worker_id):
        raise HTTPException(404, "Worker not found")
    return {
        "worker_id":     worker_id,
        "active_policy": get_active_policy(worker_id),
        "all_policies":  get_worker_policies(worker_id),
    }
