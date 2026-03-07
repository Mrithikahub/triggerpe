import pandas as pd
import random

rows = []

for i in range(300):

    temperature = random.randint(25,45)
    rainfall = random.randint(0,100)
    aqi = random.randint(50,450)
    wind_speed = random.randint(5,40)
    traffic_index = random.randint(20,90)
    flood_risk = random.randint(0,1)

    if rainfall > 60 or aqi > 350 or temperature > 42:
        risk = 1
    else:
        risk = 0

    rows.append([
        temperature,
        rainfall,
        aqi,
        wind_speed,
        traffic_index,
        flood_risk,
        risk
    ])

df = pd.DataFrame(rows, columns=[
    "temperature",
    "rainfall",
    "aqi",
    "wind_speed",
    "traffic_index",
    "flood_risk",
    "risk"
])

df.to_csv("dataset.csv", index=False)

print("Dataset generated with", len(df), "rows")