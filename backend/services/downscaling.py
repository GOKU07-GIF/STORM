import math


# ============================================================
# 5 KM PROTOTYPE GRID GENERATOR
# ============================================================

def generate_5km_grid(
    center_lat,
    center_lon,
    intensity
):
    """
    Generate a spatially varying 2 x 2
    prototype 5 km grid inside the
    12 km parent region.

    IMPORTANT:
    This is NOT a trained AI downscaling model.

    It is a deterministic prototype spatial
    refinement used to demonstrate the
    intended 12 km -> 5 km workflow.
    """

    # --------------------------------------------------------
    # Geographic conversion
    # --------------------------------------------------------

    KM_PER_DEGREE_LAT = 111.32

    CELL_SIZE_KM = 5.0

    HALF_CELL_KM = CELL_SIZE_KM / 2.0


    # Longitude distance changes with latitude.

    longitude_km_factor = max(
        0.1,
        math.cos(
            math.radians(
                center_lat
            )
        )
    )


    KM_PER_DEGREE_LON = (
        KM_PER_DEGREE_LAT *
        longitude_km_factor
    )


    # --------------------------------------------------------
    # 2 x 2 child-cell centres
    #
    # Refined coverage:
    #
    #       10 km x 10 km
    #
    # This remains inside the approximate
    # 12 km parent region.
    # --------------------------------------------------------

    positions = [

        {
            "name": "SW",
            "x_km": -2.5,
            "y_km": -2.5
        },

        {
            "name": "SE",
            "x_km": 2.5,
            "y_km": -2.5
        },

        {
            "name": "NW",
            "x_km": -2.5,
            "y_km": 2.5
        },

        {
            "name": "NE",
            "x_km": 2.5,
            "y_km": 2.5
        }

    ]


    # --------------------------------------------------------
    # Prototype sub-grid hotspot
    #
    # Strongest region is shifted slightly
    # toward the north-east.
    # --------------------------------------------------------

    hotspot_x_km = 0.8

    hotspot_y_km = 0.9

    sigma_km = 3.2


    # --------------------------------------------------------
    # Calculate spatial weights
    # --------------------------------------------------------

    raw_weights = []


    for position in positions:

        dx = (
            position["x_km"]
            -
            hotspot_x_km
        )


        dy = (
            position["y_km"]
            -
            hotspot_y_km
        )


        distance_squared = (
            dx ** 2
            +
            dy ** 2
        )


        # Gaussian hotspot component.

        gaussian_component = math.exp(

            -distance_squared
            /
            (
                2 *
                sigma_km ** 2
            )

        )


        # ----------------------------------------------------
        # Directional component
        # ----------------------------------------------------

        normalized_x = (
            position["x_km"] +
            2.5
        ) / 5.0


        normalized_y = (
            position["y_km"] +
            2.5
        ) / 5.0


        directional_component = (

            0.85
            +
            (
                0.10 *
                normalized_x
            )
            +
            (
                0.10 *
                normalized_y
            )

        )


        # ----------------------------------------------------
        # Combined weight
        # ----------------------------------------------------

        weight = (

            (
                0.70 *
                gaussian_component
            )

            +

            (
                0.30 *
                directional_component
            )

        )


        raw_weights.append(
            weight
        )


    # --------------------------------------------------------
    # Normalize weights
    # --------------------------------------------------------

    maximum_weight = max(
        raw_weights
    )


    normalized_weights = [

        weight / maximum_weight

        for weight
        in raw_weights

    ]


    # --------------------------------------------------------
    # Build refined cells
    # --------------------------------------------------------

    grid = []


    for index, position in enumerate(
        positions
    ):

        normalized_weight = (
            normalized_weights[index]
        )


        # ----------------------------------------------------
        # Keep spatial variation.
        #
        # Lowest cell:
        # approximately 72% of input intensity
        #
        # Highest cell:
        # approximately 100%
        # ----------------------------------------------------

        local_factor = (

            0.72

            +

            (
                0.28 *
                normalized_weight
            )

        )


        local_intensity = (

            float(intensity)
            *
            local_factor

        )


        # ----------------------------------------------------
        # Convert km offsets to degrees
        # ----------------------------------------------------

        latitude_offset = (
            position["y_km"]
            /
            KM_PER_DEGREE_LAT
        )


        longitude_offset = (
            position["x_km"]
            /
            KM_PER_DEGREE_LON
        )


        # ----------------------------------------------------
        # Final cell coordinates
        # ----------------------------------------------------

        cell_latitude = (

            center_lat
            +
            latitude_offset

        )


        cell_longitude = (

            center_lon
            +
            longitude_offset

        )


        # ----------------------------------------------------
        # Store cell
        # ----------------------------------------------------

        grid.append({

            "cell_id":
                f"5KM-{index + 1:03d}",

            "position":
                position["name"],

            "latitude":
                round(
                    cell_latitude,
                    5
                ),

            "longitude":
                round(
                    cell_longitude,
                    5
                ),

            "intensity":
                round(
                    local_intensity,
                    4
                ),

            "relative_intensity":
                round(
                    normalized_weight,
                    4
                )

        })


    return grid


# ============================================================
# COMPLETE DOWNSCALING
# ============================================================

def downscale_event(
    centroid,
    anomaly_score
):
    """
    Perform prototype 12 km -> 5 km
    spatial refinement.
    """

    grid = generate_5km_grid(

        center_lat=centroid["latitude"],

        center_lon=centroid["longitude"],

        intensity=anomaly_score

    )


    # --------------------------------------------------------
    # Intensity statistics
    # --------------------------------------------------------

    intensities = [

        cell["intensity"]

        for cell in grid

    ]


    peak_intensity = max(
        intensities
    )


    minimum_intensity = min(
        intensities
    )


    mean_intensity = (

        sum(intensities)
        /
        len(intensities)

    )


    intensity_range = (

        peak_intensity
        -
        minimum_intensity

    )


    # --------------------------------------------------------
    # Percentage spatial variation
    # --------------------------------------------------------

    if peak_intensity != 0:

        spatial_variation = (

            intensity_range
            /
            peak_intensity

        ) * 100.0

    else:

        spatial_variation = 0.0


    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {

        "source_resolution_km":
            12,

        "target_resolution_km":
            5,

        "method":
            "Prototype Spatial Gradient Refinement",

        "model_type":
            "Deterministic Demo Refinement",

        "parent_center": {

            "latitude":
                round(
                    centroid["latitude"],
                    3
                ),

            "longitude":
                round(
                    centroid["longitude"],
                    3
                )

        },

        "parent_boundary_km":
            12,

        "refined_coverage_km":
            "10 x 10",

        "grid_size":
            "2 x 2",

        "grid":
            grid,

        "mean_intensity":
            round(
                mean_intensity,
                4
            ),

        "peak_intensity":
            round(
                peak_intensity,
                4
            ),

        "minimum_intensity":
            round(
                minimum_intensity,
                4
            ),

        "intensity_range":
            round(
                intensity_range,
                4
            ),

        "spatial_variation":
            round(
                spatial_variation,
                2
            ),

        "model_status":
            "DEMO / PROTOTYPE"

    }