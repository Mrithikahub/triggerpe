import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import matplotlib.pyplot as plt

# load dataset
data = pd.read_csv("dataset.csv")

# features
X = data[['temperature','rainfall','aqi','wind_speed','traffic_index','flood_risk']]
y = data['risk']

# train test split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# model
model = RandomForestClassifier(n_estimators=200)

# train
model.fit(X_train,y_train)

# predictions
predictions = model.predict(X_test)

# accuracy
accuracy = accuracy_score(y_test,predictions)
print("Model Accuracy:", accuracy)

# save model
joblib.dump(model,"risk_model.pkl")

print("Risk model trained and saved")

# feature importance
importance = model.feature_importances_
features = X.columns

plt.bar(features, importance)
plt.title("Feature Importance for Risk Prediction")
plt.xlabel("Features")
plt.ylabel("Importance")
plt.show()