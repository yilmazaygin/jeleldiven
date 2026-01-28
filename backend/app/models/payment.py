from sqlalchemy import String, DateTime, ForeignKey, Float, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
import enum
from app.database.base import Base


class PaymentType(str, enum.Enum):
    CASH = "cash"
    TRANSFER = "transfer"


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    payment_type: Mapped[PaymentType] = mapped_column(Enum(PaymentType), nullable=False)
    received_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="payments")
