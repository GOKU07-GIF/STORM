from math import radians, sin, cos, sqrt, atan2


def calculate_centroid(cells):
    """
    Calculate the geographic centroid of extreme cells.
    """

    if not cells:
        return None

    latitude_sum = sum(cell["latitude"] for cell in cells)
    longitude_sum = sum(cell["longitude"] for cell in cells)

    return {
        "latitude": round(latitude_sum / len(cells), 3),
        "longitude": round(longitude_sum / len(cells), 3)
    }


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two geographic coordinates.

    Returns distance in kilometers.
    """

    earth_radius = 6371.0

    lat1 = radians(lat1)
    lat2 = radians(lat2)

    delta_lat = radians(lat2 - lat1)
    delta_lon = radians(lon2 - lon1)

    a = (
        sin(delta_lat / 2) ** 2
        +
        cos(lat1)
        * cos(lat2)
        * sin(delta_lon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return earth_radius * c


def calculate_bearing(lat1, lon1, lat2, lon2):
    """
    Calculate approximate movement direction.
    """

    lat1 = radians(lat1)
    lat2 = radians(lat2)

    delta_lon = radians(lon2 - lon1)

    x = sin(delta_lon) * cos(lat2)

    y = (
        cos(lat1) * sin(lat2)
        -
        sin(lat1) * cos(lat2) * cos(delta_lon)
    )

    bearing = atan2(x, y)

    bearing = (bearing * 180 / 3.141592653589793 + 360) % 360

    return round(bearing, 1)


def direction_from_bearing(bearing):
    """
    Convert bearing into a simple compass direction.
    """

    directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ]

    index = int((bearing + 22.5) / 45) % 8

    return directions[index]


def track_event(forecast_steps):
    """
    Track the extreme anomaly through forecast time.
    """

    trajectory = []

    previous_centroid = None

    for step in forecast_steps:

        extreme_cells = [
            cell
            for cell in step["cells"]
            if cell["is_extreme"]
        ]

        centroid = calculate_centroid(extreme_cells)

        if centroid is None:
            continue

        movement = {
            "distance_km": 0.0,
            "bearing": 0.0,
            "direction": "STATIONARY"
        }

        if previous_centroid:

            distance = haversine_distance(
                previous_centroid["latitude"],
                previous_centroid["longitude"],
                centroid["latitude"],
                centroid["longitude"]
            )

            bearing = calculate_bearing(
                previous_centroid["latitude"],
                previous_centroid["longitude"],
                centroid["latitude"],
                centroid["longitude"]
            )

            movement = {
                "distance_km": round(distance, 2),
                "bearing": bearing,
                "direction": direction_from_bearing(bearing)
            }

        trajectory.append({
            "forecast_time": step["forecast_time"],
            "centroid": centroid,
            "extreme_cells": extreme_cells,
            "movement": movement
        })

        previous_centroid = centroid

    return trajectory