from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from app.database.session import get_db
from app.models.user import User
from app.models.order import Order, OrderItem, OrderNote
from app.models.product import Product
from app.models.payment import Payment
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse, OrderNoteCreate, PaymentCreate, OrderCancelRequest
from app.core.security import get_current_user
from app.services.activity_log import log_activity
from app.services.stock_service import create_delivery_stock_movement

router = APIRouter(prefix="/orders", tags=["Orders"])


async def enrich_order_response(order: Order) -> dict:
    total_amount = sum(item.total_price for item in order.items)
    paid_amount = sum(payment.amount for payment in order.payments)
    remaining_amount = total_amount - paid_amount
    is_fully_paid = remaining_amount <= 0
    is_delivered = order.delivered_at is not None
    is_fully_completed = is_delivered and is_fully_paid
    
    return {
        **{k: v for k, v in order.__dict__.items() if not k.startswith('_')},
        "items": order.items,
        "payments": order.payments,
        "notes": order.notes,
        "total_amount": total_amount,
        "paid_amount": paid_amount,
        "remaining_amount": remaining_amount,
        "is_fully_paid": is_fully_paid,
        "is_delivered": is_delivered,
        "is_fully_completed": is_fully_completed
    }


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = Order(
        customer_id=order_data.customer_id,
        created_by=current_user.id
    )
    db.add(order)
    await db.flush()
    
    for item_data in order_data.items:
        result = await db.execute(select(Product).where(Product.id == item_data.product_id))
        product = result.scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {item_data.product_id} not found")
        
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data.product_id,
            product_name_snapshot=product.name,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            total_price=item_data.quantity * item_data.unit_price
        )
        db.add(order_item)
    
    await db.commit()
    await db.refresh(order, ["items", "payments", "notes"])
    await log_activity(db, "orders", order.id, "created", current_user.id)
    
    return await enrich_order_response(order)


@router.get("/", response_model=list[OrderResponse])
async def list_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Order).options(
            selectinload(Order.items),
            selectinload(Order.payments),
            selectinload(Order.notes)
        )
    )
    orders = result.scalars().all()
    return [await enrich_order_response(order) for order in orders]


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(
            selectinload(Order.items),
            selectinload(Order.payments),
            selectinload(Order.notes)
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    return await enrich_order_response(order)


@router.patch("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order_data: OrderUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    if order.is_cancelled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot update cancelled order")
    
    if order.delivered_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot update delivered order")
    
    if order_data.items is not None:
        for item in order.items:
            await db.delete(item)
        await db.flush()
        
        for item_data in order_data.items:
            result = await db.execute(select(Product).where(Product.id == item_data.product_id))
            product = result.scalar_one_or_none()
            if not product:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {item_data.product_id} not found")
            
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data.product_id,
                product_name_snapshot=product.name,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                total_price=item_data.quantity * item_data.unit_price
            )
            db.add(order_item)
    
    order.updated_by = current_user.id
    await db.commit()
    await db.refresh(order, ["items", "payments", "notes"])
    await log_activity(db, "orders", order.id, "updated", current_user.id)
    
    return await enrich_order_response(order)


@router.post("/{order_id}/deliver", response_model=OrderResponse)
async def deliver_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    if order.is_cancelled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot deliver cancelled order")
    
    if order.delivered_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order already delivered")
    
    order.delivered_at = datetime.utcnow()
    order.delivered_by = current_user.id
    
    for item in order.items:
        await create_delivery_stock_movement(db, item.product_id, item.quantity, order.id, current_user.id)
    
    await db.commit()
    await db.refresh(order, ["items", "payments", "notes"])
    await log_activity(db, "orders", order.id, "delivered", current_user.id)
    
    return await enrich_order_response(order)


@router.post("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: int,
    cancel_data: OrderCancelRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(
            selectinload(Order.items),
            selectinload(Order.payments),
            selectinload(Order.notes)
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    if order.is_cancelled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order already cancelled")
    
    order.is_cancelled = True
    order.cancelled_by = current_user.id
    order.cancellation_reason = cancel_data.cancellation_reason
    
    await db.commit()
    await db.refresh(order)
    await log_activity(db, "orders", order.id, "cancelled", current_user.id, cancel_data.cancellation_reason)
    
    return await enrich_order_response(order)


@router.post("/{order_id}/notes", status_code=status.HTTP_201_CREATED)
async def add_order_note(
    order_id: int,
    note_data: OrderNoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    note = OrderNote(
        order_id=order_id,
        note=note_data.note,
        created_by=current_user.id
    )
    db.add(note)
    await db.commit()
    await log_activity(db, "order_notes", note.id, "note_added", current_user.id)
    return {"message": "Note added successfully"}


@router.delete("/{order_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order_note(
    order_id: int,
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(OrderNote).where(
            OrderNote.id == note_id,
            OrderNote.order_id == order_id
        )
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    
    await log_activity(db, "order_notes", note_id, "note_deleted", current_user.id)
    await db.delete(note)
    await db.commit()


@router.post("/{order_id}/payments", status_code=status.HTTP_201_CREATED)
async def add_payment(
    order_id: int,
    payment_data: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    if order.is_cancelled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot add payment to cancelled order")
    
    payment = Payment(
        order_id=order_id,
        amount=payment_data.amount,
        payment_type=payment_data.payment_type,
        received_by=current_user.id
    )
    db.add(payment)
    await db.commit()
    await log_activity(db, "payments", payment.id, "payment_added", current_user.id, f"Amount: {payment_data.amount}")
    return {"message": "Payment added successfully"}
