from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class FeedbackType(str, Enum):
    REPORT_ISSUE = "report_issue"
    LOST_FOUND = "lost_found"
    GENERAL_FEEDBACK = "general_feedback"

class FeedbackCategory(str, Enum):
    LATE_BUS = "late_bus"
    CLEANLINESS = "cleanliness"
    SAFETY = "safety"
    DRIVER_BEHAVIOR = "driver_behavior"
    LOST_ITEM = "lost_item"
    FOUND_ITEM = "found_item"
    OTHER = "other"

class FeedbackStatus(str, Enum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"
    CLOSED = "closed"

class FeedbackPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class Location(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None

class Feedback(BaseModel):
    type: FeedbackType
    category: FeedbackCategory
    message: str
    contact_info: Optional[str] = None
    location: Optional[Location] = None
    route_id: Optional[str] = None
    bus_id: Optional[str] = None
    stop_id: Optional[str] = None
    status: FeedbackStatus = FeedbackStatus.PENDING
    priority: FeedbackPriority = FeedbackPriority.MEDIUM
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True
