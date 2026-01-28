from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database.session import get_db
from app.models.user import User
from app.models.customer import Customer, CustomerStatus, CustomerNote
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse, CustomerStatusCreate, CustomerNoteCreate
from app.core.security import get_current_user
from app.services.activity_log import log_activity

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_data: CustomerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = Customer(**customer_data.model_dump())
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    await log_activity(db, "customers", customer.id, "created", current_user.id)
    
    # Eagerly load relationships
    result = await db.execute(
        select(Customer).where(Customer.id == customer.id).options(
            selectinload(Customer.statuses),
            selectinload(Customer.notes)
        )
    )
    customer = result.scalar_one()
    return customer


@router.get("/", response_model=list[CustomerResponse])
async def list_customers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Customer).options(
            selectinload(Customer.statuses),
            selectinload(Customer.notes)
        )
    )
    customers = result.scalars().all()
    return customers


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Customer).where(Customer.id == customer_id).options(
            selectinload(Customer.statuses),
            selectinload(Customer.notes)
        )
    )
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer


@router.patch("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: int,
    customer_data: CustomerUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    update_data = customer_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)
    
    await db.commit()
    await db.refresh(customer)
    await log_activity(db, "customers", customer.id, "updated", current_user.id)
    
    # Eagerly load relationships
    result = await db.execute(
        select(Customer).where(Customer.id == customer.id).options(
            selectinload(Customer.statuses),
            selectinload(Customer.notes)
        )
    )
    customer = result.scalar_one()
    return customer


@router.post("/{customer_id}/statuses", status_code=status.HTTP_201_CREATED)
async def add_customer_status(
    customer_id: int,
    status_data: CustomerStatusCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    result = await db.execute(
        select(CustomerStatus).where(
            CustomerStatus.customer_id == customer_id,
            CustomerStatus.status == status_data.status
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status already assigned")
    
    customer_status = CustomerStatus(
        customer_id=customer_id,
        status=status_data.status,
        assigned_by=current_user.id
    )
    db.add(customer_status)
    await db.commit()
    await log_activity(db, "customer_statuses", customer_status.id, "status_added", current_user.id, f"Status: {status_data.status}")
    return {"message": "Status added successfully"}


@router.delete("/{customer_id}/statuses/{status_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_customer_status(
    customer_id: int,
    status_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(CustomerStatus).where(
            CustomerStatus.id == status_id,
            CustomerStatus.customer_id == customer_id
        )
    )
    customer_status = result.scalar_one_or_none()
    if not customer_status:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Status not found")
    
    await log_activity(db, "customer_statuses", status_id, "status_removed", current_user.id, f"Status: {customer_status.status}")
    await db.delete(customer_status)
    await db.commit()


@router.post("/{customer_id}/notes", status_code=status.HTTP_201_CREATED)
async def add_customer_note(
    customer_id: int,
    note_data: CustomerNoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    note = CustomerNote(
        customer_id=customer_id,
        note=note_data.note,
        created_by=current_user.id
    )
    db.add(note)
    await db.commit()
    await log_activity(db, "customer_notes", note.id, "note_added", current_user.id)
    return {"message": "Note added successfully"}


@router.delete("/{customer_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer_note(
    customer_id: int,
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(CustomerNote).where(
            CustomerNote.id == note_id,
            CustomerNote.customer_id == customer_id
        )
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    
    await log_activity(db, "customer_notes", note_id, "note_deleted", current_user.id)
    await db.delete(note)
    await db.commit()
