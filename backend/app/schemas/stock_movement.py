from pydantic import BaseModel, ConfigDict
from datetime import datetime


class StockMovementCreate(BaseModel):
    product_id: int
    movement_type: str
    quantity: int
    total_cost: float | None = None
    order_id: int | None = None
    customer_id: int | None = None
    description: str | None = None


class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    movement_type: str
    quantity: int
    total_cost: float | None
    average_unit_cost: float | None
    order_id: int | None
    customer_id: int | None
    description: str | None
    created_by: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
