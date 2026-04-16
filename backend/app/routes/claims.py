from fastapi  import APIRouter, HTTPException
from app.models.schemas          import ClaimCreate
from app.services.fraud_detector import detect_fraud
from app.services.payout_service import process_payout
from app.utils.database          import (
    create_claim, get_worker, get_worker_claims,
    get_all_claims, get_active_policy, db
)

router = APIRouter()


@router.post("/create", status_code=201)
def submit_claim(body: ClaimCreate):
    worker = get_worker(body.worker_id)
    if not worker:
        raise HTTPException(404, "Worker not found")

    policy = get_active_policy(body.worker_id)
    if not policy:
        raise HTTPException(400, "No active policy found")

    fraud_score, fraud_flags, status = detect_fraud(
        worker_id=body.worker_id,
        trigger_type=body.trigger_type,
        amount=body.amount,
        location=body.location,
        gps_lat=body.gps_lat,
        gps_lng=body.gps_lng,
    )

    payout_receipt = process_payout(body.worker_id, "PENDING", body.amount) if status == "approved" else None

    claim = create_claim({
        "worker_id":      body.worker_id,
        "policy_id":      policy["policy_id"],
        "trigger_type":   body.trigger_type,
        "amount":         body.amount,
        "status":         status,
        "fraud_score":    fraud_score,
        "fraud_flags":    fraud_flags,
        "location":       body.location,
        "is_auto":        False,
        "payout_receipt": payout_receipt,
        "gps_lat":        body.gps_lat,   # Phase 3: persist for audit trail
        "gps_lng":        body.gps_lng,
    })

    return {
        "claim_id":       claim["claim_id"],
        "worker_id":      body.worker_id,
        "amount":         body.amount,
        "status":         status,
        "fraud_score":    fraud_score,
        "payout_receipt": payout_receipt,
    }


@router.get("/all")
def all_claims():
    claims = get_all_claims()
    return {
        "total":    len(claims),
        "approved": sum(1 for c in claims if c["status"] == "approved"),
        "review":   sum(1 for c in claims if c["status"] == "review"),
        "rejected": sum(1 for c in claims if c["status"] == "rejected"),
        "claims":   claims,
    }


@router.get("/{worker_id}")
def get_claims(worker_id: str):
    if not get_worker(worker_id):
        raise HTTPException(404, "Worker not found")
    claims    = get_worker_claims(worker_id)
    total_paid = sum(c["amount"] for c in claims if c["status"] == "approved")
    return {"worker_id": worker_id, "total_claims": len(claims), "total_paid": total_paid, "claims": claims}


@router.patch("/{claim_id}/approve")
def approve_claim(claim_id: str):
    claim = db["claims"].get(claim_id)
    if not claim:
        raise HTTPException(404, "Claim not found")
    if claim["status"] != "review":
        raise HTTPException(400, f"Claim is '{claim['status']}', not 'review'")
    payout = process_payout(claim["worker_id"], claim_id, claim["amount"])
    claim["status"]         = "approved"
    claim["payout_receipt"] = payout
    return {"claim_id": claim_id, "status": "approved", "payout": payout}


@router.patch("/{claim_id}/reject")
def reject_claim(claim_id: str):
    claim = db["claims"].get(claim_id)
    if not claim:
        raise HTTPException(404, "Claim not found")
    claim["status"] = "rejected"
    return {"claim_id": claim_id, "status": "rejected"}
