from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class RouteInfo(BaseModel):
    route_id: str
    route_number: str
    route_name: str

class Stop(BaseModel):
    stop_id: str
    stop_name: str
    location: dict  # For geospatial queries: {"type": "Point", "coordinates": [lon, lat]}
    routes: List[RouteInfo]
    amenities: List[str] = Field(default_factory=list)
    crowd_level: str = Field(default="medium", pattern="^(very_low|low|medium|high|very_high)$")
    last_crowding_update: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "stop_id": "S001",
                "stop_name": "Central Station",
                "location": {"type": "Point", "coordinates": [-74.0060, 40.7128]},
                "crowd_level": "medium",
                "amenities": ["shelter", "bench", "lighting"]
            }
        }
