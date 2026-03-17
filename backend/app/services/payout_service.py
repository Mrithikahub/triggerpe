import uuid
from datetime import datetime


def process_payout(worker_id: str, claim_id: str, amount: float) -> dict:
    if amount <= 0:
        return {"status": "skipped", "amount": 0, "message": "Zero payout amount"}

    return {
        "status":         "success",
        "amount":         amount,
        "message":        "Payout processed successfully",
        "transaction_id": "TXN-" + str(uuid.uuid4())[:8].upper(),
        "worker_id":      worker_id,
        "claim_id":       claim_id,
        "mode":           "UPI",
        "processed_at":   datetime.utcnow().isoformat() + "Z",
    }
