import pandas as pd
import joblib

# load trained risk model
model = joblib.load("risk_model.pkl")

def calculate_premium(temp, rain, aqi, wind, traffic, flood):

    # prepare input
    input_data = pd.DataFrame([{
        "temperature": temp,
        "rainfall": rain,
        "aqi": aqi,
        "wind_speed": wind,
        "traffic_index": traffic,
        "flood_risk": flood
    }])

    # predict risk
    prediction = model.predict(input_data)

    if prediction[0] == 1:
        risk_level = "HIGH"
    else:
        risk_level = "LOW"

    # base premium
    premium = 30

    # dynamic adjustments
    premium += rain * 0.2
    premium += (aqi / 100) * 2
    premium += traffic * 0.05

    if risk_level == "HIGH":
        premium += 10

    premium = round(premium,2)

    return risk_level, premium


# test example
risk, premium = calculate_premium(
    temp=34,
    rain=10,
    aqi=200,
    wind=5,
    traffic=60,
    flood=0
)

print("Risk Level:", risk)
print("Calculated Weekly Premium: ₹", premium)