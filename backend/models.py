from pydantic import BaseModel
from typing import Optional


class AnalysisRequest(BaseModel):
    forecast_time: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    project: str
    mode: str
    problem_statement: str