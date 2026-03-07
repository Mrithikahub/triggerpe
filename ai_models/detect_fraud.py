import joblib

model = joblib.load("fraud_model.pkl")

def detect_fraud(location_mismatch,claim_frequency,weather_match,time_anomaly,gps_speed):

    prediction = model.predict([[location_mismatch,claim_frequency,weather_match,time_anomaly,gps_speed]])

    if prediction[0] == 1:
        return "Fraudulent Claim"
    else:
        return "Normal Claim"


# test example
result = detect_fraud(1,6,0,1,130)

print("Fraud Detection Result:",result)