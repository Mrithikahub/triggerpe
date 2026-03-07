import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

# load dataset
data = pd.read_csv("fraud_dataset.csv")

X = data[['location_mismatch','claim_frequency','weather_match','time_anomaly','gps_speed']]
y = data['fraud']

# split
X_train,X_test,y_train,y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# model
model = RandomForestClassifier(n_estimators=150)

# train
model.fit(X_train,y_train)

# predictions
predictions = model.predict(X_test)

print("Fraud Model Evaluation")
print(classification_report(y_test,predictions))

# save model
joblib.dump(model,"fraud_model.pkl")

print("Fraud detection model trained and saved")