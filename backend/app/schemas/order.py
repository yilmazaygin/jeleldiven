from pydantic import BaseModel, ConfigDict
from datetime import datetime


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name_snapshot: str
    quantity: int
    unit_price: float
    total_price: float

    model_config = ConfigDict(from_attributes=True)


class OrderNoteResponse(BaseModel):
    id: int
    note: str
    created_by: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaymentResponse(BaseModel):
    id: int
    amount: float
    payment_type: str
    received_by: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemCreate]


class OrderUpdate(BaseModel):
    items: list[OrderItemCreate] | None = None


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    created_by: int
    updated_by: int | None
    cancelled_by: int | None
    cancellation_reason: str | None
    delivered_at: datetime | None
    delivered_by: int | None
    is_cancelled: bool
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemResponse] = []
    payments: list[PaymentResponse] = []
    notes: list[OrderNoteResponse] = []
    total_amount: float
    paid_amount: float
    remaining_amount: float
    is_fully_paid: bool
    is_delivered: bool
    is_fully_completed: bool

    model_config = ConfigDict(from_attributes=True)


class OrderNoteCreate(BaseModel):
    note: str


class PaymentCreate(BaseModel):
    amount: float
    payment_type: str


class OrderCancelRequest(BaseModel):
    cancellation_reason: str
