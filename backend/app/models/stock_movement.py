from sqlalchemy import String, DateTime, ForeignKey, Float, Integer, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from typing import Optional
import enum
from app.database.base import Base


class MovementType(str, enum.Enum):
    PURCHASE = "purchase"
    MANUAL_ADJUSTMENT = "manual_adjustment"
    DELIVERY = "delivery"
    PROMOTION = "promotion"
    TESTER = "tester"
    WASTE = "waste"


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    movement_type: Mapped[MovementType] = mapped_column(Enum(MovementType), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    total_cost: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    average_unit_cost: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    order_id: Mapped[Optional[int]] = mapped_column(ForeignKey("orders.id"), nullable=True)
    customer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("customers.id"), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
