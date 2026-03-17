from fastapi import APIRouter, HTTPException
from app.utils.database              import get_worker
from app.services.premium_calculator import calculate_premium

router = APIRouter()


@router.get("/{worker_id}")
def get_premium(worker_id: str):
    worker = get_worker(worker_id)
    if not worker:
        raise HTTPException(404, "Worker not found")
    return calculate_premium(worker)
