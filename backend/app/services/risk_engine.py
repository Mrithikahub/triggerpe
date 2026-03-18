import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv("WEATHER_API_KEY")

def get_weather(city: str):
    """Fetch real weather data"""
    if not API_KEY:
        print("⚠️ No API key, using fallback data")
        return {
            "temperature": 30,
            "rainfall": 10,
            "aqi": 100,
            "traffic_index": 60
        }
    
    url = f"http://api.weatherapi.com/v1/current.json?key={API_KEY}&q={city}"
    
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        
        return {
            "temperature": data["current"]["temp_c"],
            "rainfall": data["current"].get("precip_mm", 0),
            "aqi": data["current"].get("air_quality", {}).get("pm2_5", 50),
            "traffic_index": 60
        }
    except Exception as e:
        print(f"Weather API error: {e}")
        return {
            "temperature": 30,
            "rainfall": 10,
            "aqi": 100,
            "traffic_index": 60
        }

def compute_risk_score(city: str, platform: str, earning: float) -> float:
    """Calculate risk score based on weather and other factors"""
    weather = get_weather(city)
    
    rain_factor = weather["rainfall"] / 100
    aqi_factor = weather["aqi"] / 500
    traffic_factor = weather["traffic_index"] / 100
    
    score = (rain_factor + aqi_factor + traffic_factor) / 3
    return round(min(score, 1.0), 2)

def risk_label(score: float) -> str:
    """Convert numeric score to label"""
    if score < 0.3:
        return "low"
    elif score < 0.6:
        return "medium"
    else:
        return "high"

def get_risk_zone(city: str) -> str:
    """Determine risk zone based on city"""
    city = city.lower()
    if city in ["mumbai", "delhi"]:
        return "high"
    elif city in ["chennai", "bangalore", "hyderabad"]:
        return "medium"
    else:
        return "low"

# ===== NEW FUNCTION NEEDED FOR PREMIUM CALCULATOR =====
def compute_weekly_premium(score: float, city: str, earning: float) -> float:
    """Calculate weekly premium based on risk score"""
    base_rate = 30
    
    zone = get_risk_zone(city)
    
    # Zone surcharge
    if zone == "high":
        zone_charge = 25
    elif zone == "medium":
        zone_charge = 15
    else:
        zone_charge = 0
    
    # Risk-based loading
    risk_loading = score * 20
    
    # Disruption loading
    disruption_loading = score * 30
    
    premium = base_rate + zone_charge + risk_loading + disruption_loading
    return round(premium, 2)