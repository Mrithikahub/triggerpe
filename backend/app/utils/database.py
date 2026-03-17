import uuid
from datetime import datetime
from typing   import Optional

db = {
    "workers":  {},
    "policies": {},
    "claims":   {},
}


def new_id(prefix: str) -> str:
    return f"{prefix}-{str(uuid.uuid4())[:6].upper()}"

def now() -> datetime:
    return datetime.utcnow()


def create_worker(data: dict) -> dict:
    wid = new_id("W")
    worker = {**data, "worker_id": wid, "registered_at": now()}
    db["workers"][wid] = worker
    return worker

def get_worker(worker_id: str) -> Optional[dict]:
    return db["workers"].get(worker_id)

def get_all_workers() -> list:
    return list(db["workers"].values())


def create_policy(data: dict) -> dict:
    pid = new_id("POL")
    policy = {**data, "policy_id": pid}
    db["policies"][pid] = policy
    return policy

def get_worker_policies(worker_id: str) -> list:
    return [p for p in db["policies"].values() if p["worker_id"] == worker_id]

def get_active_policy(worker_id: str) -> Optional[dict]:
    for p in db["policies"].values():
        if p["worker_id"] == worker_id and p["status"] == "active":
            if p["end_date"] >= now():
                return p
    return None

def get_all_policies() -> list:
    return list(db["policies"].values())


def create_claim(data: dict) -> dict:
    cid = new_id("CLM")
    claim = {**data, "claim_id": cid, "created_at": now()}
    db["claims"][cid] = claim
    return claim

def get_worker_claims(worker_id: str) -> list:
    return [c for c in db["claims"].values() if c["worker_id"] == worker_id]

def get_all_claims() -> list:
    return list(db["claims"].values())

def duplicate_exists(worker_id: str, trigger_type: str) -> bool:
    today = now().date()
    for c in db["claims"].values():
        if (c["worker_id"] == worker_id
                and c["trigger_type"] == trigger_type
                and c["created_at"].date() == today):
            return True
    return False
