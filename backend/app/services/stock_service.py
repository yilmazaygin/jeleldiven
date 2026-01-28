from sqlalchemy.ext.asyncio import AsyncSession
from app.models.stock_movement import StockMovement, MovementType


async def create_delivery_stock_movement(
    db: AsyncSession,
    product_id: int,
    quantity: int,
    order_id: int,
    user_id: int
):
    movement = StockMovement(
        product_id=product_id,
        movement_type=MovementType.DELIVERY,
        quantity=-quantity,
        order_id=order_id,
        created_by=user_id,
        description=f"Delivery for order #{order_id}"
    )
    db.add(movement)
