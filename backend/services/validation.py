import math


# ============================================================
# SIMULATED REFERENCE
# ============================================================

def create_simulated_reference(predicted_grid):
    """
    Create deterministic simulated reference data.

    IMPORTANT:
    This is NOT real weather observation data.
    It is only for prototype validation.
    """

    factors = [0.95, 1.10, 0.90, 1.05]

    reference = []

    for index, cell in enumerate(predicted_grid):

        predicted = float(
            cell["intensity"]
        )

        factor = factors[
            index % len(factors)
        ]

        reference_value = (
            predicted * factor
        )

        reference.append({
            "cell_id": cell["cell_id"],
            "latitude": cell["latitude"],
            "longitude": cell["longitude"],
            "value": round(
                reference_value,
                4
            )
        })

    return reference


# ============================================================
# MAE
# ============================================================

def calculate_mae(
    predicted,
    reference
):

    if not predicted:
        return 0.0

    errors = [
        abs(p - r)
        for p, r in zip(
            predicted,
            reference
        )
    ]

    return (
        sum(errors)
        /
        len(errors)
    )


# ============================================================
# RMSE
# ============================================================

def calculate_rmse(
    predicted,
    reference
):

    if not predicted:
        return 0.0

    squared_errors = [
        (p - r) ** 2
        for p, r in zip(
            predicted,
            reference
        )
    ]

    return math.sqrt(
        sum(squared_errors)
        /
        len(squared_errors)
    )


# ============================================================
# CORRELATION
# ============================================================

def calculate_correlation(
    predicted,
    reference
):

    if len(predicted) < 2:
        return 0.0

    mean_p = (
        sum(predicted)
        /
        len(predicted)
    )

    mean_r = (
        sum(reference)
        /
        len(reference)
    )

    numerator = 0.0

    denominator_p = 0.0

    denominator_r = 0.0

    for p, r in zip(
        predicted,
        reference
    ):

        dp = p - mean_p

        dr = r - mean_r

        numerator += (
            dp * dr
        )

        denominator_p += (
            dp ** 2
        )

        denominator_r += (
            dr ** 2
        )

    denominator = math.sqrt(
        denominator_p *
        denominator_r
    )

    if denominator == 0:
        return 0.0

    return (
        numerator
        /
        denominator
    )


# ============================================================
# PEAK ERROR
# ============================================================

def calculate_peak_error(
    predicted,
    reference
):

    if (
        not predicted
        or
        not reference
    ):

        return 0.0

    predicted_peak = max(
        predicted
    )

    reference_peak = max(
        reference
    )

    if reference_peak == 0:
        return 0.0

    return (
        abs(
            predicted_peak
            -
            reference_peak
        )
        /
        reference_peak
    ) * 100.0


# ============================================================
# SPATIAL OVERLAP
# ============================================================

def calculate_spatial_overlap(
    predicted,
    reference
):

    """
    Prototype spatial overlap.

    Hotspots are defined as cells whose
    intensity is >= 90% of their field peak.

    Jaccard overlap:

        intersection / union
    """

    if (
        not predicted
        or
        not reference
    ):

        return 0.0

    predicted_peak = max(
        predicted
    )

    reference_peak = max(
        reference
    )

    predicted_threshold = (
        predicted_peak *
        0.90
    )

    reference_threshold = (
        reference_peak *
        0.90
    )

    predicted_hotspots = {

        index

        for index, value
        in enumerate(predicted)

        if value >= predicted_threshold

    }

    reference_hotspots = {

        index

        for index, value
        in enumerate(reference)

        if value >= reference_threshold

    }

    union = (
        predicted_hotspots
        |
        reference_hotspots
    )

    intersection = (
        predicted_hotspots
        &
        reference_hotspots
    )

    if not union:
        return 0.0

    return (
        len(intersection)
        /
        len(union)
    ) * 100.0


# ============================================================
# COMPLETE VALIDATION
# ============================================================

def validate_downscaled_grid(
    predicted_grid
):

    """
    Complete prototype validation
    against a simulated reference field.
    """

    if not predicted_grid:

        return {

            "status":
                "DEMO / SIMULATED VALIDATION",

            "reference_type":
                "SIMULATED REFERENCE FIELD",

            "metrics": {

                "mae": 0.0,

                "rmse": 0.0,

                "correlation": 0.0,

                "peak_error_percent": 0.0,

                "spatial_overlap_percent": 0.0

            },

            "predicted_grid": [],

            "reference_grid": []

        }


    predicted = [

        float(
            cell["intensity"]
        )

        for cell in predicted_grid

    ]


    reference_grid = (
        create_simulated_reference(
            predicted_grid
        )
    )


    reference = [

        float(
            cell["value"]
        )

        for cell in reference_grid

    ]


    mae = calculate_mae(
        predicted,
        reference
    )


    rmse = calculate_rmse(
        predicted,
        reference
    )


    correlation = calculate_correlation(
        predicted,
        reference
    )


    peak_error = calculate_peak_error(
        predicted,
        reference
    )


    spatial_overlap = calculate_spatial_overlap(
        predicted,
        reference
    )


    return {

        "status":
            "DEMO / SIMULATED VALIDATION",

        "reference_type":
            "SIMULATED REFERENCE FIELD",

        "metrics": {

            "mae":
                round(
                    mae,
                    4
                ),

            "rmse":
                round(
                    rmse,
                    4
                ),

            "correlation":
                round(
                    correlation,
                    4
                ),

            "peak_error_percent":
                round(
                    peak_error,
                    2
                ),

            "spatial_overlap_percent":
                round(
                    spatial_overlap,
                    2
                )

        },

        "predicted_grid":
            predicted_grid,

        "reference_grid":
            reference_grid

    }