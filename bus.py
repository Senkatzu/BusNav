from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class Location(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class NextStop(BaseModel):
    stop_id: str
    stop_name: str
    estimated_arrival: datetime

class Bus(BaseModel):
    bus_id: str
    route_id: str
    current_location: Location
    speed: float = Field(default=0, ge=0)
    direction: float = Field(default=0, ge=0, le=360)
    occupancy: str = Field(default="medium", pattern="^(low|medium|high)$")
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    next_stop: Optional[NextStop] = None
    status: str = Field(default="active", pattern="^(active|inactive|maintenance)$")

    class Config:
        json_schema_extra = {
            "example": {
                "bus_id": "B001",
                "route_id": "R001",
                "current_location": {"latitude": 40.7128, "longitude": -74.0060},
                "speed": 25.5,
                "direction": 45,
                "occupancy": "medium",
                "last_updated": "2023-01-01T12:00:00Z",
                "status": "active"
            }
        }
