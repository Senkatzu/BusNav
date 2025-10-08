from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class CrowdingFactors(BaseModel):
    weather: Optional[str] = None
    special_event: bool = False
    holiday: bool = False

class CrowdingData(BaseModel):
    stop_id: str
    route_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    day_of_week: int = Field(..., ge=0, le=6)  # 0-6 (Sunday-Saturday)
    hour_of_day: int = Field(..., ge=0, le=23)  # 0-23
    actual_crowding: str = Field(..., pattern="^(very_low|low|medium|high|very_high)$")
    predicted_crowding: Optional[str] = Field(None, pattern="^(very_low|low|medium|high|very_high)$")
    confidence: Optional[float] = Field(None, ge=0, le=1)
    factors: Optional[CrowdingFactors] = None
