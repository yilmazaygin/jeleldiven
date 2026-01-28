from pydantic import BaseModel, ConfigDict
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    category: str
    is_active: bool = True
    cost_metadata: str | None = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    is_active: bool | None = None
    cost_metadata: str | None = None


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
