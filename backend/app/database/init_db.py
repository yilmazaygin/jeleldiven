import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.database.base import Base
from app.models.user import User
from app.models.customer import Customer, CustomerStatus, CustomerNote
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderNote
from app.models.payment import Payment
from app.models.stock_movement import StockMovement
from app.models.activity_log import ActivityLog
from app.core.config import settings
from app.core.security import get_password_hash
from app.database.session import AsyncSessionLocal


async def init_database():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as session:
        admin_user = User(
            username="admin",
            full_name="Admin User",
            hashed_password=get_password_hash("admin123"),
            is_active=True
        )
        session.add(admin_user)
        await session.flush()
        
        sample_customer = Customer(
            name="Sample Customer",
            primary_phone="+1234567890",
            additional_phones="+0987654321"
        )
        session.add(sample_customer)
        await session.flush()
        
        customer_status = CustomerStatus(
            customer_id=sample_customer.id,
            status="VIP",
            assigned_by=admin_user.id
        )
        session.add(customer_status)
        
        customer_note = CustomerNote(
            customer_id=sample_customer.id,
            note="This is a sample customer note.",
            created_by=admin_user.id
        )
        session.add(customer_note)
        
        sample_product = Product(
            name="Sample Product",
            category="Electronics",
            is_active=True,
            cost_metadata="Sample cost metadata"
        )
        session.add(sample_product)
        await session.flush()
        
        stock_movement = StockMovement(
            product_id=sample_product.id,
            movement_type="purchase",
            quantity=100,
            total_cost=1000.0,
            average_unit_cost=10.0,
            description="Initial stock purchase",
            created_by=admin_user.id
        )
        session.add(stock_movement)
        
        sample_order = Order(
            customer_id=sample_customer.id,
            created_by=admin_user.id
        )
        session.add(sample_order)
        await session.flush()
        
        order_item = OrderItem(
            order_id=sample_order.id,
            product_id=sample_product.id,
            product_name_snapshot=sample_product.name,
            quantity=5,
            unit_price=15.0,
            total_price=75.0
        )
        session.add(order_item)
        
        order_note = OrderNote(
            order_id=sample_order.id,
            note="Sample order note",
            created_by=admin_user.id
        )
        session.add(order_note)
        
        payment = Payment(
            order_id=sample_order.id,
            amount=50.0,
            payment_type="cash",
            received_by=admin_user.id
        )
        session.add(payment)
        
        activity_log = ActivityLog(
            table_name="orders",
            record_id=sample_order.id,
            action="created",
            user_id=admin_user.id,
            details="Sample order created during initialization"
        )
        session.add(activity_log)
        
        await session.commit()
    
    print("Database initialized successfully with sample data!")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(init_database())
