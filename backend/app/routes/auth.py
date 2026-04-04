"""
OTP Authentication via Fast2SMS
POST /auth/send-otp   — generates OTP, sends SMS, stores in memory
POST /auth/verify-otp — verifies OTP, returns worker_id
"""
import random
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.notification_service import send_sms
from app.utils.database import get_all_workers

router = APIRouter()

# In-memory OTP store: { phone: { otp, expires_at } }
_otp_store: dict = {}
OTP_EXPIRY_SECONDS = 300  # 5 minutes


class SendOtpRequest(BaseModel):
    phone: str
    email: str = ""


class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str


@router.post("/send-otp")
def send_otp(body: SendOtpRequest):
    phone = body.phone.strip().replace(" ", "").replace("-", "")
    # Normalize: keep only digits for SMS
    digits_only = "".join(c for c in phone if c.isdigit())
    # Take last 10 digits
    if len(digits_only) >= 10:
        digits_only = digits_only[-10:]
    else:
        raise HTTPException(400, "Invalid phone number. Need at least 10 digits.")

    otp = str(random.randint(100000, 999999))
    _otp_store[digits_only] = {"otp": otp, "expires_at": time.time() + OTP_EXPIRY_SECONDS}

    msg = (
        f"TriggerPe OTP: {otp}. "
        f"Your one-time password for login. Valid for 5 minutes. "
        f"Do not share with anyone. - TriggerPe"
    )
    sent = send_sms(digits_only, msg)

    return {
        "success": True,
        "message": "OTP sent successfully" if sent else "OTP generated (SMS mock mode)",
        "phone": f"****{digits_only[-4:]}",
        # Only include demo_otp in dev — remove in production
        "demo_otp": otp,
    }


@router.post("/verify-otp")
def verify_otp(body: VerifyOtpRequest):
    phone = body.phone.strip().replace(" ", "").replace("-", "")
    digits_only = "".join(c for c in phone if c.isdigit())
    if len(digits_only) >= 10:
        digits_only = digits_only[-10:]

    record = _otp_store.get(digits_only)
    if not record:
        raise HTTPException(400, "No OTP found for this number. Please request a new OTP.")
    if time.time() > record["expires_at"]:
        del _otp_store[digits_only]
        raise HTTPException(400, "OTP expired. Please request a new one.")
    if record["otp"] != body.otp.strip():
        raise HTTPException(400, "Incorrect OTP. Please try again.")

    # OTP verified — clean up
    del _otp_store[digits_only]

    # Try to find worker by phone in DB
    all_workers = get_all_workers()
    worker_id = None
    for w in all_workers:
        w_phone = (w.get("phone") or "").replace(" ", "").replace("-", "")
        w_digits = "".join(c for c in w_phone if c.isdigit())
        if w_digits.endswith(digits_only[-10:]):
            worker_id = w["worker_id"]
            break

    return {
        "success": True,
        "message": "OTP verified successfully",
        "worker_id": worker_id,  # None if no matching worker — frontend handles
        "authenticated": True,
    }
