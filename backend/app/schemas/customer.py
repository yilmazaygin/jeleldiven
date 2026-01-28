from pydantic import BaseModel, ConfigDict
from datetime import datetime


class CustomerBase(BaseModel):
    name: str
    primary_phone: str
    additional_phones: str | None = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: str | None = None
    primary_phone: str | None = None
    additional_phones: str | None = None


class CustomerStatusResponse(BaseModel):
    id: int
    status: str
    assigned_at: datetime
    assigned_by: int

    model_config = ConfigDict(from_attributes=True)


class CustomerNoteResponse(BaseModel):
    id: int
    note: str
    created_by: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime
    statuses: list[CustomerStatusResponse] = []
    notes: list[CustomerNoteResponse] = []

    model_config = ConfigDict(from_attributes=True)


class CustomerStatusCreate(BaseModel):
    status: str


class CustomerNoteCreate(BaseModel):
    note: str
