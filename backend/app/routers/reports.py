from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database.session import get_db
from app.models.user import User
from app.models.order import Order, OrderItem
from app.models.payment import Payment
from app.models.stock_movement import StockMovement, MovementType
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.reports import DashboardReport, CustomerRevenueReport, StockReport
from app.core.security import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/dashboard", response_model=DashboardReport)
async def get_dashboard_report(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pending_deliveries = await db.execute(
        select(func.count(Order.id)).where(
            Order.delivered_at.is_(None),
            Order.is_cancelled == False
        )
    )
    pending_deliveries_count = pending_deliveries.scalar() or 0
    
    subquery = (
        select(
            Order.id,
            func.sum(OrderItem.total_price).label("total"),
            func.coalesce(
                select(func.sum(Payment.amount))
                .where(Payment.order_id == Order.id)
                .scalar_subquery(),
                0
            ).label("paid")
        )
        .join(OrderItem, OrderItem.order_id == Order.id)
        .where(Order.is_cancelled == False)
        .group_by(Order.id)
        .subquery()
    )
    
    pending_payments = await db.execute(
        select(func.count()).where(subquery.c.total > subquery.c.paid)
    )
    pending_payments_count = pending_payments.scalar() or 0
    
    total_revenue_result = await db.execute(
        select(func.sum(Payment.amount))
        .join(Order, Order.id == Payment.order_id)
        .where(Order.is_cancelled == False)
    )
    total_revenue = total_revenue_result.scalar() or 0.0
    
    return {
        "pending_deliveries_count": pending_deliveries_count,
        "pending_payments_count": pending_payments_count,
        "total_revenue": total_revenue
    }


@router.get("/customer-revenue", response_model=list[CustomerRevenueReport])
async def get_customer_revenue_report(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(
            Customer.id,
            Customer.name,
            func.coalesce(func.sum(Payment.amount), 0).label("total_revenue")
        )
        .outerjoin(Order, Order.customer_id == Customer.id)
        .outerjoin(Payment, Payment.order_id == Order.id)
        .where(Order.is_cancelled == False)
        .group_by(Customer.id, Customer.name)
        .order_by(func.coalesce(func.sum(Payment.amount), 0).desc())
    )
    
    rows = result.all()
    return [
        {
            "customer_id": row[0],
            "customer_name": row[1],
            "total_revenue": row[2]
        }
        for row in rows
    ]


@router.get("/stock", response_model=list[StockReport])
async def get_stock_report(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_stock_query = (
        select(
            StockMovement.product_id,
            func.sum(StockMovement.quantity).label("total_stock")
        )
        .group_by(StockMovement.product_id)
        .subquery()
    )
    
    reserved_stock_query = (
        select(
            OrderItem.product_id,
            func.sum(OrderItem.quantity).label("reserved_stock")
        )
        .join(Order, Order.id == OrderItem.order_id)
        .where(
            Order.delivered_at.is_(None),
            Order.is_cancelled == False
        )
        .group_by(OrderItem.product_id)
        .subquery()
    )
    
    result = await db.execute(
        select(
            Product.id,
            Product.name,
            func.coalesce(total_stock_query.c.total_stock, 0).label("total_stock"),
            func.coalesce(reserved_stock_query.c.reserved_stock, 0).label("reserved_stock")
        )
        .outerjoin(total_stock_query, total_stock_query.c.product_id == Product.id)
        .outerjoin(reserved_stock_query, reserved_stock_query.c.product_id == Product.id)
        .order_by(Product.name)
    )
    
    rows = result.all()
    return [
        {
            "product_id": row[0],
            "product_name": row[1],
            "total_stock": row[2],
            "reserved_stock": row[3],
            "available_stock": row[2] - row[3]
        }
        for row in rows
    ]
