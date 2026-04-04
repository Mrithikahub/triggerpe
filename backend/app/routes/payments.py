from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import razorpay
import hmac
import hashlib
import os

router = APIRouter(prefix="/payments", tags=["Payments"])

KEY_ID     = os.getenv("RAZORPAY_KEY_ID",     "rzp_test_YOUR_KEY_ID_HERE")
KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET",  "YOUR_KEY_SECRET_HERE")


class OrderCreate(BaseModel):
    amount: int        # in paise (₹49 → 4900)
    worker_id: str
    plan: str          # basic | standard | premium


class PaymentVerify(BaseModel):
    razorpay_order_id:   str
    razorpay_payment_id: str
    razorpay_signature:  str


@router.post("/create-order")
def create_order(body: OrderCreate):
    try:
        client = razorpay.Client(auth=(KEY_ID, KEY_SECRET))
        order = client.order.create({
            "amount":   body.amount,
            "currency": "INR",
            "receipt":  f"gs_{body.worker_id}_{body.plan}",
            "notes":    {"worker_id": body.worker_id, "plan": body.plan},
        })
        return {
            "order_id": order["id"],
            "amount":   body.amount,
            "currency": "INR",
            "key_id":   KEY_ID,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify")
def verify_payment(body: PaymentVerify):
    try:
        msg = f"{body.razorpay_order_id}|{body.razorpay_payment_id}"
        expected = hmac.new(
            KEY_SECRET.encode(),
            msg.encode(),
            hashlib.sha256,
        ).hexdigest()
        if expected != body.razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        return {"success": True, "payment_id": body.razorpay_payment_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
