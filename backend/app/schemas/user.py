from pydantic import BaseModel, ConfigDict
from datetime import datetime


class UserBase(BaseModel):
    username: str
    full_name: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: str | None = None
    password: str | None = None
    is_active: bool | None = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    access_token: str
    token_type: str = "bearer"
