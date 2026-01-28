from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.session import get_db
from app.models.user import User
from app.models.stock_movement import StockMovement
from app.schemas.stock_movement import StockMovementCreate, StockMovementResponse
from app.core.security import get_current_user
from app.services.activity_log import log_activity

router = APIRouter(prefix="/stock-movements", tags=["Stock Movements"])


@router.post("/", response_model=StockMovementResponse, status_code=status.HTTP_201_CREATED)
async def create_stock_movement(
    movement_data: StockMovementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    average_unit_cost = None
    if movement_data.total_cost is not None and movement_data.quantity != 0:
        average_unit_cost = movement_data.total_cost / abs(movement_data.quantity)
    
    movement = StockMovement(
        product_id=movement_data.product_id,
        movement_type=movement_data.movement_type,
        quantity=movement_data.quantity,
        total_cost=movement_data.total_cost,
        average_unit_cost=average_unit_cost,
        order_id=movement_data.order_id,
        customer_id=movement_data.customer_id,
        description=movement_data.description,
        created_by=current_user.id
    )
    db.add(movement)
    await db.commit()
    await db.refresh(movement)
    await log_activity(db, "stock_movements", movement.id, f"stock_{movement_data.movement_type}", current_user.id)
    return movement


@router.get("/", response_model=list[StockMovementResponse])
async def list_stock_movements(
    product_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(StockMovement)
    if product_id is not None:
        query = query.where(StockMovement.product_id == product_id)
    
    result = await db.execute(query.order_by(StockMovement.created_at.desc()))
    movements = result.scalars().all()
    return movements


@router.get("/{movement_id}", response_model=StockMovementResponse)
async def get_stock_movement(
    movement_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(StockMovement).where(StockMovement.id == movement_id))
    movement = result.scalar_one_or_none()
    if not movement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock movement not found")
    return movement
