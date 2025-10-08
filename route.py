from typing import List, Optional
from pydantic import BaseModel, Field

class StopSequence(BaseModel):
    stop_id: str
    stop_name: str
    sequence: int = Field(..., ge=1)
    latitude: float
    longitude: float
    estimated_time: int = Field(..., ge=0)  # minutes from origin

class Schedule(BaseModel):
    weekdays: List[str]  # HH:MM format
    weekends: List[str]
    frequency: int = Field(..., ge=1)  # minutes between buses

class Route(BaseModel):
    route_id: str
    route_number: str
    route_name: str
    origin: str
    destination: str
    stops: List[StopSequence]
    schedule: Schedule
    active: bool = True
    color: str = Field(default="#007bff")

    class Config:
        json_schema_extra = {
            "example": {
                "route_id": "R001",
                "route_number": "101",
                "route_name": "Downtown Express",
                "origin": "Central Station",
                "destination": "City Mall",
                "color": "#FF6B6B",
                "active": True
            }
        }
