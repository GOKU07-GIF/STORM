def calculate_anomaly(forecast_value, baseline_value, standard_deviation):
    """
    Calculate standardized anomaly.

    Formula:
        anomaly = (forecast - baseline) / standard_deviation
    """

    if standard_deviation <= 0:
        return 0.0

    anomaly = (
        forecast_value - baseline_value
    ) / standard_deviation

    return round(anomaly, 3)


def classify_severity(anomaly):
    """
    Prototype severity classification.

    These thresholds are for the STORMIS demo only.
    They are NOT official operational warning thresholds.
    """

    if anomaly < 0.3:
        return "NORMAL"

    elif anomaly < 0.5:
        return "MODERATE"

    elif anomaly < 0.7:
        return "HIGH"

    else:
        return "SEVERE"


def detect_anomalies(cells):
    """
    Process forecast cells and identify anomalous rainfall.
    """

    results = []

    for cell in cells:

        anomaly = calculate_anomaly(
            cell["rainfall"],
            cell["baseline_rainfall"],
            cell["rainfall_std"]
        )

        severity = classify_severity(anomaly)

        processed_cell = {
            **cell,
            "anomaly_score": anomaly,
            "severity": severity,
            "is_extreme": anomaly >= 0.7
        }

        results.append(processed_cell)

    return results