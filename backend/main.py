from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

from models import AnalysisRequest

from services.anomaly import detect_anomalies
from services.tracking import track_event
from services.downscaling import downscale_event
from services.risk import calculate_risk, classify_risk
from services.validation import validate_downscaled_grid


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="STORMIS API",
    description=(
        "Spatio-Temporal Observation & Risk Monitoring "
        "Intelligence System"
    ),
    version="0.1.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

DATA_FILE = os.path.join(
    BASE_DIR,
    "data",
    "demo_forecast.json"
)


# ============================================================
# DATA LOADER
# ============================================================

def load_demo_data():

    with open(
        DATA_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


# ============================================================
# FORECAST PROCESSING
# ============================================================

def process_forecast():

    data = load_demo_data()

    processed_steps = []

    for step in data["forecast"]:

        anomalies = detect_anomalies(
            step["cells"]
        )

        processed_steps.append({

            "forecast_time":
                step["forecast_time"],

            "cells":
                anomalies

        })

    return processed_steps


# ============================================================
# RISK METRICS
# ============================================================

def calculate_time_risk(
    index,
    extreme_cells
):

    if not extreme_cells:

        return {

            "risk_score":
                0.0,

            "risk_level":
                "LOW"

        }


    max_anomaly = max(
        float(
            cell["anomaly_score"]
        )
        for cell in extreme_cells
    )


    affected_cells = len(
        extreme_cells
    )


    persistence = (
        index + 1
    )


    # Prototype uncertainty.
    uncertainty = 0.25


    risk_score = calculate_risk(

        anomaly_score=
            max_anomaly,

        affected_cells=
            affected_cells,

        persistence=
            persistence,

        uncertainty=
            uncertainty

    )


    risk_level = classify_risk(
        risk_score
    )


    return {

        "risk_score":
            round(
                risk_score,
                3
            ),

        "risk_level":
            risk_level

    }


# ============================================================
# BUILD TIME METRICS
# ============================================================

def build_time_metrics(
    trajectory
):

    time_metrics = []

    for index, point in enumerate(
        trajectory
    ):

        extreme_cells = (
            point["extreme_cells"]
        )


        if not extreme_cells:

            continue


        max_anomaly = max(

            float(
                cell["anomaly_score"]
            )

            for cell
            in extreme_cells

        )


        affected_cells = len(
            extreme_cells
        )


        risk = calculate_time_risk(

            index=index,

            extreme_cells=
                extreme_cells

        )


        strongest_cell = max(

            extreme_cells,

            key=lambda cell:
                cell["anomaly_score"]

        )


        time_metrics.append({

            "forecast_time":
                point["forecast_time"],

            "latitude":
                point["centroid"]["latitude"],

            "longitude":
                point["centroid"]["longitude"],

            "anomaly":
                round(
                    max_anomaly,
                    3
                ),

            "severity":
                strongest_cell["severity"],

            "affected_cells":
                affected_cells,

            "risk_score":
                risk["risk_score"],

            "risk_level":
                risk["risk_level"],

            "movement":
                point["movement"],

            "extreme_cells":
                extreme_cells

        })


    return time_metrics


# ============================================================
# BUILD VALIDATION FOR EVERY FORECAST TIME
# ============================================================

def build_time_validation(
    processed_steps,
    trajectory
):

    validation_by_time = []


    for index, step in enumerate(
        processed_steps
    ):

        forecast_time = (
            step["forecast_time"]
        )


        matching_point = None


        for point in trajectory:

            if (
                point["forecast_time"]
                ==
                forecast_time
            ):

                matching_point = point

                break


        if matching_point is None:

            validation_by_time.append({

                "forecast_time":
                    forecast_time,

                "status":
                    "NO_EVENT",

                "metrics": None

            })

            continue


        extreme_cells = (
            matching_point[
                "extreme_cells"
            ]
        )


        if not extreme_cells:

            validation_by_time.append({

                "forecast_time":
                    forecast_time,

                "status":
                    "NO_EVENT",

                "metrics": None

            })

            continue


        max_anomaly = max(

            float(
                cell["anomaly_score"]
            )

            for cell
            in extreme_cells

        )


        downscaled = downscale_event(

            matching_point["centroid"],

            max_anomaly

        )


        validation = (
            validate_downscaled_grid(
                downscaled["grid"]
            )
        )


        validation_by_time.append({

            "forecast_time":
                forecast_time,

            "status":
                "VALIDATION_COMPLETE",

            "reference_type":
                validation[
                    "reference_type"
                ],

            "metrics":
                validation[
                    "metrics"
                ]

        })


    return validation_by_time


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {

        "project":
            "STORMIS",

        "problem_statement":
            "SIH26078",

        "mode":
            "DEMO / PROTOTYPE",

        "pipeline": [

            "Detect",

            "Track",

            "Downscale",

            "Validate",

            "Localize",

            "Alert"

        ]

    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/api/health")
def health():

    return {

        "status":
            "online",

        "project":
            "STORMIS",

        "mode":
            "DEMO / PROTOTYPE"

    }


# ============================================================
# FORECAST
# ============================================================

@app.get("/api/forecast")
def get_forecast():

    return load_demo_data()


# ============================================================
# EVENTS
# ============================================================

@app.get("/api/events")
def get_events():

    processed_steps = (
        process_forecast()
    )


    trajectory = track_event(
        processed_steps
    )


    return {

        "event_id":
            "EVT-001",

        "status":
            "ACTIVE",

        "mode":
            "DEMO / PROTOTYPE",

        "trajectory":
            trajectory

    }


# ============================================================
# MAP DATA
# ============================================================

@app.get("/api/map-data")
def get_map_data():

    processed_steps = (
        process_forecast()
    )


    trajectory = track_event(
        processed_steps
    )


    time_metrics = (
        build_time_metrics(
            trajectory
        )
    )


    validation_by_time = (
        build_time_validation(

            processed_steps,

            trajectory

        )
    )


    downscaled = None


    if trajectory:

        latest = trajectory[-1]

        extreme_cells = (
            latest["extreme_cells"]
        )


        if extreme_cells:

            max_anomaly = max(

                float(
                    cell["anomaly_score"]
                )

                for cell
                in extreme_cells

            )


            downscaled = (
                downscale_event(

                    latest["centroid"],

                    max_anomaly

                )
            )


    return {

        "status":
            "MAP_DATA_READY",

        "project":
            "STORMIS",

        "problem_statement":
            "SIH26078",

        "mode":
            "DEMO / PROTOTYPE",

        "source_resolution_km":
            12,

        "target_resolution_km":
            5,

        "forecast_steps":
            processed_steps,

        "trajectory":
            trajectory,

        "time_metrics":
            time_metrics,

        "validation_by_time":
            validation_by_time,

        "downscaled":
            downscaled

    }


# ============================================================
# VALIDATION
# ============================================================

@app.get("/api/validation")
def get_validation():

    processed_steps = (
        process_forecast()
    )


    trajectory = track_event(
        processed_steps
    )


    validation_by_time = (
        build_time_validation(

            processed_steps,

            trajectory

        )
    )


    latest_validation = None


    for validation in reversed(
        validation_by_time
    ):

        if (
            validation["status"]
            ==
            "VALIDATION_COMPLETE"
        ):

            latest_validation = (
                validation
            )

            break


    if latest_validation is None:

        return {

            "status":
                "NO_EVENT"

        }


    return {

        "project":
            "STORMIS",

        "status":
            "VALIDATION_COMPLETE",

        "mode":
            "DEMO / PROTOTYPE",

        "forecast_time":
            latest_validation[
                "forecast_time"
            ],

        "validation":
            latest_validation

    }


# ============================================================
# ANALYZE
# ============================================================

@app.post("/api/analyze")
def analyze(
    request: AnalysisRequest
):

    processed_steps = (
        process_forecast()
    )


    trajectory = track_event(
        processed_steps
    )


    if not trajectory:

        return {

            "status":
                "NO_EVENT"

        }


    latest = trajectory[-1]

    extreme_cells = (
        latest["extreme_cells"]
    )


    if not extreme_cells:

        return {

            "status":
                "NO_EVENT"

        }


    strongest_cell = max(

        extreme_cells,

        key=lambda cell:
            cell["anomaly_score"]

    )


    max_anomaly = float(

        strongest_cell[
            "anomaly_score"
        ]

    )


    affected_cells = len(
        extreme_cells
    )


    risk = calculate_time_risk(

        index=
            len(trajectory) - 1,

        extreme_cells=
            extreme_cells

    )


    downscaled = downscale_event(

        latest["centroid"],

        max_anomaly

    )


    validation = (
        validate_downscaled_grid(

            downscaled["grid"]

        )
    )


    return {

        "status":
            "ANALYSIS_COMPLETE",

        "project":
            "STORMIS",

        "problem_statement":
            "SIH26078",

        "mode":
            "DEMO / PROTOTYPE",


        "event": {

            "event_id":
                "EVT-001",

            "severity":
                strongest_cell[
                    "severity"
                ],

            "forecast_time":
                latest[
                    "forecast_time"
                ],

            "centroid":
                latest[
                    "centroid"
                ],

            "max_anomaly":
                round(
                    max_anomaly,
                    3
                ),

            "affected_cells":
                affected_cells

        },


        "tracking": {

            "trajectory":
                trajectory,

            "direction":
                latest[
                    "movement"
                ][
                    "direction"
                ],

            "movement_distance_km":
                latest[
                    "movement"
                ][
                    "distance_km"
                ]

        },


        "downscaling":
            downscaled,


        "validation":
            validation,


        "risk": {

            "score":
                risk["risk_score"],

            "level":
                risk["risk_level"]

        },


        "alert": {

            "generated":
                True,

            "message":
                "Prototype extreme weather anomaly detected.",

            "warning":
                "This alert is generated from simulated demo data."

        }

    }


# ============================================================
# DOWNSCALE
# ============================================================

@app.post("/api/downscale")
def downscale():

    processed_steps = (
        process_forecast()
    )


    trajectory = track_event(
        processed_steps
    )


    if not trajectory:

        return {

            "status":
                "NO_EVENT"

        }


    latest = trajectory[-1]

    extreme_cells = (
        latest["extreme_cells"]
    )


    if not extreme_cells:

        return {

            "status":
                "NO_EVENT"

        }


    max_anomaly = max(

        float(
            cell["anomaly_score"]
        )

        for cell
        in extreme_cells

    )


    return downscale_event(

        latest["centroid"],

        max_anomaly

    )


# ============================================================
# ALERTS
# ============================================================

@app.get("/api/alerts")
def get_alerts():

    return {

        "mode":
            "DEMO / PROTOTYPE",

        "alerts": [

            {

                "id":
                    "ALERT-001",

                "event_id":
                    "EVT-001",

                "severity":
                    "PROTOTYPE",

                "region":
                    "India",

                "message":
                    "Prototype extreme weather anomaly detected.",

                "status":
                    "DEMO"

            }

        ]

    }


# ============================================================
# DATA STATUS
# ============================================================

@app.get("/api/data-status")
def data_status():

    return {

        "mode":
            "DEMO",

        "forecast_source":
            "SIMULATED",

        "resolution_km":
            12,

        "target_resolution_km":
            5,

        "real_data_connected":
            False,

        "anomaly_engine":
            "ACTIVE",

        "tracking_engine":
            "ACTIVE",

        "downscaling_engine":
            "PROTOTYPE",

        "validation_engine":
            "DEMO / SIMULATED",

        "risk_engine":
            "ACTIVE",

        "alert_engine":
            "ACTIVE"

    }