from pydantic import BaseModel, ConfigDict
from datetime import datetime


class ActivityLogResponse(BaseModel):
    id: int
    table_name: str
    record_id: int
    action: str
    user_id: int
    created_at: datetime
    details: str | None

    model_config = ConfigDict(from_attributes=True)
