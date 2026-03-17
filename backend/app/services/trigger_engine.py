THRESHOLDS = {
    "HEAVY_RAIN":   {"field": "rainfall",    "value": 50,  "payout_mult": 1.00},
    "EXTREME_HEAT": {"field": "temperature", "value": 42,  "payout_mult": 0.75},
    "HIGH_AQI":     {"field": "aqi",         "value": 300, "payout_mult": 0.75},
}


def detect_disruptions(city: str, temperature: float, rainfall: float, aqi: float) -> list:
    readings = {"rainfall": rainfall, "temperature": temperature, "aqi": aqi}
    triggered = []
    for trigger_type, rule in THRESHOLDS.items():
        if readings[rule["field"]] >= rule["value"]:
            triggered.append({
                "trigger_type": trigger_type,
                "reading":      readings[rule["field"]],
                "threshold":    rule["value"],
                "payout_mult":  rule["payout_mult"],
                "city":         city.lower(),
            })
    return triggered


def calculate_payout(coverage: float, payout_mult: float) -> float:
    return round(coverage * payout_mult, 2)


def get_all_thresholds() -> dict:
    return THRESHOLDS
