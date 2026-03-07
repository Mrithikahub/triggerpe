import joblib

# load model
model = joblib.load("risk_model.pkl")

def predict_risk(temp,rain,aqi,wind,traffic,flood):

    prediction = model.predict([[temp,rain,aqi,wind,traffic,flood]])

    if prediction[0] == 1:
        return "HIGH RISK"
    else:
        return "LOW RISK"


# test example
result = predict_risk(42,70,360,25,80,1)

print("Risk Prediction:",result)