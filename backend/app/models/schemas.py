from pydantic import BaseModel, Field
from typing   import Optional
from enum     import Enum


class Platform(str, Enum):
    zomato   = "Zomato"
    swiggy   = "Swiggy"
    zepto    = "Zepto"
    blinkit  = "Blinkit"
    amazon   = "Amazon"
    flipkart = "Flipkart"
    dunzo    = "Dunzo"
    bigbasket = "BigBasket"


class WorkerRegister(BaseModel):
    name:              str            = Field(..., example="Arjun Sharma")
    city:              str            = Field(..., example="Mumbai")
    platform:          Platform       = Field(..., example="Zomato")
    avg_daily_earning: float          = Field(500.0, gt=0, example=500.0)
    phone:             Optional[str]  = Field(None, example="9876543210")
    email:             Optional[str]  = Field(None, example="arjun@example.com")


class PolicyCreate(BaseModel):
    worker_id: str = Field(..., example="W-ABC123")
    weeks:     int = Field(1, ge=1, le=52, example=1)


class TriggerInput(BaseModel):
    city:        str   = Field(..., example="Mumbai")
    temperature: float = Field(..., example=30.0)
    rainfall:    float = Field(..., example=80.0)
    aqi:         float = Field(..., example=200.0)
    wind_speed:  float = Field(0.0, example=0.0)


class ClaimCreate(BaseModel):
    worker_id:    str            = Field(..., example="W-ABC123")
    trigger_type: str            = Field(..., example="HEAVY_RAIN")
    amount:       float          = Field(..., example=350.0)
    location:     str            = Field(..., example="Mumbai")
    gps_lat:      Optional[float] = None
    gps_lng:      Optional[float] = None
