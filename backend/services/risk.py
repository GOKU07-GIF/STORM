def calculate_risk(
    anomaly_score,
    affected_cells,
    persistence,
    uncertainty
):
    """
    Calculate a prototype risk score.

    This is a demo scoring model and is NOT
    an official disaster-warning methodology.
    """

    intensity_component = min(
        anomaly_score / 3.0,
        1.0
    )

    spatial_component = min(
        affected_cells / 5.0,
        1.0
    )

    persistence_component = min(
        persistence / 4.0,
        1.0
    )

    uncertainty_component = 1.0 - min(
        uncertainty,
        1.0
    )

    risk = (
        intensity_component * 0.45
        +
        spatial_component * 0.20
        +
        persistence_component * 0.20
        +
        uncertainty_component * 0.15
    )

    risk = min(max(risk, 0.0), 1.0)

    return round(risk, 3)


def classify_risk(risk_score):

    if risk_score < 0.30:
        return "LOW"

    if risk_score < 0.50:
        return "MODERATE"

    if risk_score < 0.70:
        return "HIGH"

    return "SEVERE"