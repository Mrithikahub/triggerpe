from fastapi import APIRouter, HTTPException
from app.models.schemas  import WorkerRegister
from app.services.risk_engine import compute_risk_score, risk_label, get_risk_zone
from app.utils.database  import create_worker, get_worker, get_all_workers

router = APIRouter()


@router.post("/register", status_code=201)
def register_worker(body: WorkerRegister):
    score  = compute_risk_score(body.city, body.platform, body.avg_daily_earning)
    worker = create_worker({
        "name":              body.name,
        "city":              body.city.strip().lower(),
        "platform":          body.platform,
        "avg_daily_earning": body.avg_daily_earning,
        "risk_score":        score,
        "risk_level":        risk_label(score),
        "risk_zone":         get_risk_zone(body.city),
    })
    return {
        "worker_id":  worker["worker_id"],
        "name":       worker["name"],
        "risk_level": worker["risk_level"],
        "risk_score": score,
    }


@router.get("/{worker_id}")
def get_worker_profile(worker_id: str):
    w = get_worker(worker_id)
    if not w:
        raise HTTPException(404, "Worker not found")
    return w


@router.get("/")
def list_workers():
    workers = get_all_workers()
    return {"total": len(workers), "workers": workers}
