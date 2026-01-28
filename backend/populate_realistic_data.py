"""
Realistic Sample Data Generator for Jeleldiven Application

This script generates comprehensive, realistic sample data that simulates
a cosmetics/beauty product distribution business that has been operating
for several months with active daily usage.
"""

import asyncio
import random
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import create_async_engine
from app.database.base import Base
from app.models.user import User
from app.models.customer import Customer, CustomerStatus, CustomerNote
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderNote
from app.models.payment import Payment, PaymentType
from app.models.stock_movement import StockMovement, MovementType
from app.models.activity_log import ActivityLog
from app.core.config import settings
from app.core.security import get_password_hash
from app.database.session import AsyncSessionLocal


# Realistic Turkish names and businesses
CUSTOMER_NAMES = [
    "Güzellik Merkezi Aslı", "Zeynep Kuaför Salonu", "Elegance Beauty Center",
    "Merve Güzellik ve Bakım", "Serenity Spa & Wellness", "Ayşe'nin Kuaförü",
    "Diamond Beauty Lounge", "Fatma Güzellik Salonu", "Royal Beauty Studio",
    "Esra Estetik ve Bakım", "Paradise Beauty Center", "Deniz Kuaför",
    "Glitter Beauty Bar", "Selin Güzellik Merkezi", "Prestige Spa Center",
    "Cansu Kozmetik ve Bakım", "Butterfly Beauty House", "İrem Güzellik",
    "VIP Beauty Lounge", "Elif Estetik Merkezi", "Golden Touch Spa",
    "Büşra Güzellik Salonu", "Crystal Beauty Center", "Nazlı Kuaför",
    "Platinum Beauty Studio", "Gizem Estetik", "Rainbow Beauty Parlor",
    "Derya Güzellik Merkezi", "Luxe Beauty Lounge", "Tuğba Kozmetik",
    "Pınar Güzellik Salonu", "Elite Beauty Center", "Seda Kuaför ve Bakım",
    "Bella Beauty House", "Yasemin Estetik", "Şeyma Güzellik Merkezi",
    "Damla Kozmetik Salonu", "Azra Güzellik ve SPA", "Melisa Beauty Center"
]

PRODUCT_DATA = {
    "Saç Bakımı": [
        ("Argan Yağlı Şampuan - 500ml", 85, 145),
        ("Keratinli Saç Maskesi - 300ml", 95, 165),
        ("Organik Hindistan Cevizi Yağı - 250ml", 75, 130),
        ("Profesyonel Saç Serumu - 100ml", 110, 185),
        ("Biotin Şampuan - 400ml", 80, 140),
        ("Argan Saç Kremi - 300ml", 70, 120),
        ("Keratin Bakım Spreyi - 200ml", 65, 110),
        ("Isı Koruyucu Sprey - 150ml", 55, 95),
        ("Saç Dökülme Önleyici Tonik - 200ml", 120, 200),
        ("Hacim Veren Şampuan - 500ml", 75, 130),
    ],
    "Cilt Bakımı": [
        ("Hyaluronik Asit Serum - 30ml", 125, 210),
        ("Vitamin C Yüz Serumu - 30ml", 135, 225),
        ("Nemlendirici Yüz Kremi - 50ml", 95, 160),
        ("Göz Çevresi Kremi - 15ml", 105, 175),
        ("Retinol Gece Kremi - 50ml", 145, 240),
        ("Niacinamide Serum - 30ml", 115, 190),
        ("Gül Suyu Tonik - 200ml", 60, 100),
        ("Ceramide Nemlendirici - 75ml", 130, 215),
        ("Leke Giderici Serum - 30ml", 140, 235),
        ("Anti-Aging Krem - 50ml", 155, 260),
        ("Kolajen Booster Serum - 30ml", 125, 210),
        ("Azelaic Acid Krem - 30ml", 110, 185),
    ],
    "Makyaj": [
        ("HD Fondöten - Açık Ton", 105, 175),
        ("HD Fondöten - Orta Ton", 105, 175),
        ("HD Fondöten - Koyu Ton", 105, 175),
        ("Mat Ruj Seti (12 renk)", 85, 145),
        ("Göz Farı Paleti - Nude", 95, 160),
        ("Göz Farı Paleti - Smokey", 95, 160),
        ("Suya Dayanıklı Eyeliner", 45, 75),
        ("Hacim Veren Maskara", 65, 110),
        ("Kaş Kalemi - Kahverengi", 35, 60),
        ("Kaş Kalemi - Siyah", 35, 60),
        ("Aydınlatıcı Highlighter", 75, 125),
        ("Bronzer Paleti", 85, 140),
        ("Allık - Pembe Ton", 55, 95),
        ("Allık - Mercan Ton", 55, 95),
        ("Makyaj Sabitleyici Sprey", 70, 120),
    ],
    "Tırnak Bakımı": [
        ("Jel Oje - Kırmızı", 40, 70),
        ("Jel Oje - Pudra", 40, 70),
        ("Jel Oje - Bordo", 40, 70),
        ("Tırnak Güçlendirici", 50, 85),
        ("Cuticle Oil - 15ml", 35, 60),
        ("Tırnak Temizleyici - 250ml", 45, 75),
        ("French Manikür Seti", 65, 110),
        ("Tırnak Sanat Kiti", 95, 160),
    ],
    "Profesyonel Ekipman": [
        ("Profesyonel Saç Kurutma Makinesi", 650, 1100),
        ("Seramik Saç Düzleştirici", 450, 750),
        ("LED Tırnak Kurutma Lambası", 350, 600),
        ("Profesyonel Makyaj Fırça Seti (24 parça)", 280, 475),
        ("Yüz Temizleme Cihazı", 320, 550),
        ("Mikrodermabraziyon Cihazı", 850, 1400),
        ("Sterilizatör Cihazı", 420, 700),
    ],
    "Vücut Bakımı": [
        ("Vücut Peelingi - Kahve", 70, 120),
        ("Vücut Losyonu - 300ml", 65, 110),
        ("Antiselülit Jel - 200ml", 95, 160),
        ("Vücut Yağı - Hindistan Cevizi", 75, 130),
        ("El ve Ayak Kremi - 100ml", 55, 95),
        ("Güneş Koruyucu SPF 50 - 150ml", 85, 145),
    ],
}

CUSTOMER_STATUSES = ["VIP", "Regular", "New", "Problematic", "High-Volume", "Wholesale"]

COMPLAINT_NOTES = [
    "Müşteri ödeme konusunda sürekli gecikme yapıyor",
    "Son siparişte ürün kalitesinden şikayet etti",
    "Rakip firmadan daha ucuz bulmuş, fiyat indirimi talep ediyor",
    "Teslimatta gecikmeden şikayet etti",
    "Ürün ambalajında hasar olduğunu bildirdi",
]

POSITIVE_NOTES = [
    "Düzenli ve zamanında ödeme yapan müşteri",
    "Aylık düzenli sipariş veriyor, güvenilir",
    "Referans getirdi, yeni müşteri kazandırdı",
    "Büyük sipariş potansiyeli var",
    "Uzun vadeli işbirliği için görüşmeler yapılıyor",
]

ORDER_NOTES = [
    "Müşteri acil teslimat istedi",
    "Hediye paketi yapılacak",
    "Fatura adresi farklı",
    "Kurye ile teslim edilecek",
    "Ürünler test edildi, onaylandı",
    "Toplu sipariş, indirim uygulandı",
]


def random_date(start_days_ago, end_days_ago):
    """Generate random datetime between start and end days ago"""
    start = datetime.now() - timedelta(days=start_days_ago)
    end = datetime.now() - timedelta(days=end_days_ago)
    delta = start - end
    random_days = random.random() * delta.days
    random_seconds = random.random() * 86400
    return end + timedelta(days=random_days, seconds=random_seconds)


async def populate_realistic_data():
    """Generate comprehensive realistic sample data"""
    
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    # Recreate database
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as session:
        print("Creating users...")
        
        # Create diverse users with different roles
        users = [
            User(
                username="admin",
                full_name="Mehmet Yılmaz",
                hashed_password=get_password_hash("admin123"),
                is_active=True
            ),
            User(
                username="ayse.kaya",
                full_name="Ayşe Kaya",
                hashed_password=get_password_hash("pass123"),
                is_active=True
            ),
            User(
                username="ali.demir",
                full_name="Ali Demir",
                hashed_password=get_password_hash("pass123"),
                is_active=True
            ),
            User(
                username="zeynep.ak",
                full_name="Zeynep Ak",
                hashed_password=get_password_hash("pass123"),
                is_active=True
            ),
            User(
                username="can.yildirim",
                full_name="Can Yıldırım",
                hashed_password=get_password_hash("pass123"),
                is_active=True
            ),
            User(
                username="eski.calisan",
                full_name="Eski Çalışan",
                hashed_password=get_password_hash("pass123"),
                is_active=False  # Inactive user
            ),
        ]
        
        for user in users:
            session.add(user)
        await session.flush()
        
        active_users = [u for u in users if u.is_active]
        
        print(f"Created {len(users)} users (including {len(active_users)} active)")
        
        # Create products with realistic pricing
        print("Creating products...")
        products = []
        
        for category, items in PRODUCT_DATA.items():
            for product_name, cost, price in items:
                product = Product(
                    name=product_name,
                    category=category,
                    is_active=True,
                    cost_metadata=f'{{"purchase_cost": {cost}, "retail_price": {price}, "margin": {round((price-cost)/price*100, 1)}}}',
                    created_at=random_date(180, 150)
                )
                products.append(product)
                session.add(product)
        
        # Add some discontinued products
        discontinued = [
            ("Eski Model Saç Maşası", "Profesyonel Ekipman", 250, 450),
            ("Vintage Ruj Seti", "Makyaj", 60, 100),
            ("Klasik Tırnak Cilası", "Tırnak Bakımı", 25, 45),
        ]
        
        for name, cat, cost, price in discontinued:
            product = Product(
                name=name,
                category=cat,
                is_active=False,
                cost_metadata=f'{{"purchase_cost": {cost}, "retail_price": {price}}}',
                created_at=random_date(300, 250)
            )
            products.append(product)
            session.add(product)
        
        await session.flush()
        active_products = [p for p in products if p.is_active]
        
        print(f"Created {len(products)} products ({len(active_products)} active)")
        
        # Initial stock purchases (realistic inventory build-up)
        print("Creating initial stock movements...")
        
        for product in active_products:
            # Most products have 2-4 purchase batches over time
            num_purchases = random.randint(2, 4)
            
            for i in range(num_purchases):
                quantity = random.randint(20, 200)
                cost_data = eval(product.cost_metadata)
                unit_cost = cost_data["purchase_cost"]
                total = quantity * unit_cost
                
                stock_movement = StockMovement(
                    product_id=product.id,
                    movement_type=MovementType.PURCHASE,
                    quantity=quantity,
                    total_cost=total,
                    average_unit_cost=unit_cost,
                    description=f"Toplu alım - {quantity} adet",
                    created_by=random.choice(active_users).id,
                    created_at=random_date(180 - i*45, 175 - i*45)
                )
                session.add(stock_movement)
        
        await session.flush()
        
        # Create customers with realistic distribution
        print("Creating customers...")
        customers = []
        
        for i, name in enumerate(CUSTOMER_NAMES):
            # Generate phone numbers
            primary_phone = f"+90 5{random.randint(10, 59)} {random.randint(100, 999)} {random.randint(10, 99)} {random.randint(10, 99)}"
            additional = None
            if random.random() < 0.3:  # 30% have additional phone
                additional = f"+90 5{random.randint(10, 59)} {random.randint(100, 999)} {random.randint(10, 99)} {random.randint(10, 99)}"
            
            customer = Customer(
                name=name,
                primary_phone=primary_phone,
                additional_phones=additional,
                created_at=random_date(200, 30)
            )
            customers.append(customer)
            session.add(customer)
        
        await session.flush()
        
        # Assign statuses to customers (realistic distribution)
        status_distribution = {
            "Regular": 0.40,
            "VIP": 0.15,
            "New": 0.20,
            "High-Volume": 0.12,
            "Wholesale": 0.08,
            "Problematic": 0.05,
        }
        
        for customer in customers:
            # Assign status based on distribution
            rand = random.random()
            cumulative = 0
            selected_status = "Regular"
            
            for status, prob in status_distribution.items():
                cumulative += prob
                if rand <= cumulative:
                    selected_status = status
                    break
            
            status = CustomerStatus(
                customer_id=customer.id,
                status=selected_status,
                assigned_by=random.choice(active_users).id,
                assigned_at=customer.created_at + timedelta(days=random.randint(0, 7))
            )
            session.add(status)
            
            # Some customers have status changes over time
            if random.random() < 0.2:  # 20% changed status
                new_status = random.choice([s for s in CUSTOMER_STATUSES if s != selected_status])
                status2 = CustomerStatus(
                    customer_id=customer.id,
                    status=new_status,
                    assigned_by=random.choice(active_users).id,
                    assigned_at=random_date(60, 10)
                )
                session.add(status2)
        
        # Add customer notes (realistic interaction history)
        for customer in customers:
            num_notes = random.choices([0, 1, 2, 3, 4, 5], weights=[0.3, 0.25, 0.2, 0.15, 0.07, 0.03])[0]
            
            for _ in range(num_notes):
                if random.random() < 0.7:  # 70% positive notes
                    note_text = random.choice(POSITIVE_NOTES)
                else:
                    note_text = random.choice(COMPLAINT_NOTES)
                
                note = CustomerNote(
                    customer_id=customer.id,
                    note=note_text,
                    created_by=random.choice(active_users).id,
                    created_at=random_date(150, 5)
                )
                session.add(note)
        
        await session.flush()
        
        print(f"Created {len(customers)} customers with statuses and notes")
        
        # Create realistic orders (active business simulation)
        print("Creating orders with realistic patterns...")
        
        # Order frequency varies by customer type
        order_counts = {
            "VIP": (8, 25),
            "High-Volume": (6, 20),
            "Wholesale": (5, 15),
            "Regular": (2, 8),
            "New": (1, 3),
            "Problematic": (1, 5),
        }
        
        all_orders = []
        
        for customer in customers:
            # Get customer's current status
            from sqlalchemy import select, desc
            result = await session.execute(
                select(CustomerStatus)
                .where(CustomerStatus.customer_id == customer.id)
                .order_by(desc(CustomerStatus.assigned_at))
                .limit(1)
            )
            current_status = result.scalar_one_or_none()
            
            if not current_status:
                continue
            
            min_orders, max_orders = order_counts.get(current_status.status, (1, 5))
            num_orders = random.randint(min_orders, max_orders)
            
            for _ in range(num_orders):
                order_date = random_date(150, 0)
                
                order = Order(
                    customer_id=customer.id,
                    created_by=random.choice(active_users).id,
                    created_at=order_date,
                    updated_at=order_date
                )
                session.add(order)
                await session.flush()
                
                # Add 1-8 items per order (realistic distribution)
                num_items = random.choices([1, 2, 3, 4, 5, 6, 7, 8], 
                                          weights=[0.15, 0.25, 0.20, 0.15, 0.12, 0.08, 0.03, 0.02])[0]
                
                selected_products = random.sample(active_products, min(num_items, len(active_products)))
                order_total = 0
                
                for product in selected_products:
                    cost_data = eval(product.cost_metadata)
                    base_price = cost_data["retail_price"]
                    
                    # Bulk discounts for large orders
                    if num_items >= 5:
                        base_price *= 0.92  # 8% discount
                    elif num_items >= 3:
                        base_price *= 0.95  # 5% discount
                    
                    # VIP and Wholesale get better prices
                    if current_status.status == "VIP":
                        base_price *= 0.90
                    elif current_status.status == "Wholesale":
                        base_price *= 0.88
                    
                    quantity = random.randint(1, 10)
                    unit_price = round(base_price, 2)
                    total_price = round(unit_price * quantity, 2)
                    order_total += total_price
                    
                    order_item = OrderItem(
                        order_id=order.id,
                        product_id=product.id,
                        product_name_snapshot=product.name,
                        quantity=quantity,
                        unit_price=unit_price,
                        total_price=total_price
                    )
                    session.add(order_item)
                    
                    # Create delivery stock movement
                    delivery_movement = StockMovement(
                        product_id=product.id,
                        movement_type=MovementType.DELIVERY,
                        quantity=-quantity,  # Negative for outgoing
                        order_id=order.id,
                        customer_id=customer.id,
                        description=f"Sipariş #{order.id} - {customer.name}",
                        created_by=order.created_by,
                        created_at=order_date
                    )
                    session.add(delivery_movement)
                
                # Order lifecycle: Some delivered, some pending, some cancelled
                order_age_days = (datetime.now() - order_date).days
                
                if order_age_days > 3:  # Orders older than 3 days
                    dice = random.random()
                    
                    if dice < 0.75:  # 75% delivered
                        delivery_date = order_date + timedelta(days=random.randint(1, 5))
                        order.delivered_at = delivery_date
                        order.delivered_by = random.choice(active_users).id
                        order.updated_at = delivery_date
                        
                    elif dice < 0.85:  # 10% cancelled
                        cancel_date = order_date + timedelta(days=random.randint(1, 3))
                        order.is_cancelled = True
                        order.cancelled_by = random.choice(active_users).id
                        order.cancellation_reason = random.choice([
                            "Müşteri vazgeçti",
                            "Stokta ürün kalmadı",
                            "Ödeme yapılmadı",
                            "Müşteri iletişime geçilemedi",
                            "Yanlış sipariş girildi"
                        ])
                        order.updated_at = cancel_date
                    
                    # Remaining 15% stay pending
                
                # Add order notes (40% of orders)
                if random.random() < 0.4:
                    note = OrderNote(
                        order_id=order.id,
                        note=random.choice(ORDER_NOTES),
                        created_by=random.choice(active_users).id,
                        created_at=order_date + timedelta(hours=random.randint(1, 48))
                    )
                    session.add(note)
                
                # Payment patterns
                if not order.is_cancelled:
                    # Delivered orders: 95% have payments
                    # Pending orders: 40% have partial payments
                    
                    if order.delivered_at:
                        payment_probability = 0.95
                        full_payment_probability = 0.85
                    else:
                        payment_probability = 0.40
                        full_payment_probability = 0.20
                    
                    if random.random() < payment_probability:
                        if random.random() < full_payment_probability:
                            # Full payment
                            payment_amount = order_total
                            num_payments = 1 if random.random() < 0.7 else 2  # Sometimes split payment
                            
                            if num_payments == 1:
                                payment = Payment(
                                    order_id=order.id,
                                    amount=payment_amount,
                                    payment_type=random.choice([PaymentType.CASH, PaymentType.TRANSFER]),
                                    received_by=random.choice(active_users).id,
                                    created_at=order.delivered_at or order_date + timedelta(days=random.randint(0, 2))
                                )
                                session.add(payment)
                            else:
                                # Split into 2 payments
                                first_amount = round(payment_amount * random.uniform(0.4, 0.6), 2)
                                second_amount = round(payment_amount - first_amount, 2)
                                
                                payment1 = Payment(
                                    order_id=order.id,
                                    amount=first_amount,
                                    payment_type=PaymentType.CASH,
                                    received_by=random.choice(active_users).id,
                                    created_at=order_date + timedelta(days=random.randint(0, 1))
                                )
                                session.add(payment1)
                                
                                payment2 = Payment(
                                    order_id=order.id,
                                    amount=second_amount,
                                    payment_type=PaymentType.TRANSFER,
                                    received_by=random.choice(active_users).id,
                                    created_at=order_date + timedelta(days=random.randint(2, 10))
                                )
                                session.add(payment2)
                        else:
                            # Partial payment
                            partial_amount = round(order_total * random.uniform(0.3, 0.7), 2)
                            payment = Payment(
                                order_id=order.id,
                                amount=partial_amount,
                                payment_type=random.choice([PaymentType.CASH, PaymentType.TRANSFER]),
                                received_by=random.choice(active_users).id,
                                created_at=order_date + timedelta(days=random.randint(0, 3))
                            )
                            session.add(payment)
                
                all_orders.append(order)
        
        await session.flush()
        
        print(f"Created {len(all_orders)} orders with items, payments, and notes")
        
        # Additional stock movements (promotions, waste, manual adjustments)
        print("Creating additional stock movements...")
        
        # Promotional giveaways
        for _ in range(random.randint(15, 30)):
            product = random.choice(active_products)
            promo_movement = StockMovement(
                product_id=product.id,
                movement_type=MovementType.PROMOTION,
                quantity=-random.randint(1, 5),
                customer_id=random.choice(customers).id,
                description=random.choice([
                    "Kampanya hediyesi",
                    "VIP müşteri hediyesi",
                    "Tanıtım ürünü",
                    "Yeni müşteri hediyesi"
                ]),
                created_by=random.choice(active_users).id,
                created_at=random_date(120, 5)
            )
            session.add(promo_movement)
        
        # Tester products
        for _ in range(random.randint(20, 40)):
            product = random.choice(active_products)
            tester_movement = StockMovement(
                product_id=product.id,
                movement_type=MovementType.TESTER,
                quantity=-random.randint(1, 3),
                customer_id=random.choice(customers).id if random.random() < 0.6 else None,
                description="Test ürünü verildi",
                created_by=random.choice(active_users).id,
                created_at=random_date(150, 5)
            )
            session.add(tester_movement)
        
        # Waste/Damage
        for _ in range(random.randint(10, 20)):
            product = random.choice(active_products)
            waste_movement = StockMovement(
                product_id=product.id,
                movement_type=MovementType.WASTE,
                quantity=-random.randint(1, 5),
                description=random.choice([
                    "Hasarlı ürün - kullanılamaz",
                    "Son kullanma tarihi geçmiş",
                    "Kırık/dökülmüş ürün",
                    "Kalite kontrolden geçemedi"
                ]),
                created_by=random.choice(active_users).id,
                created_at=random_date(140, 10)
            )
            session.add(waste_movement)
        
        # Manual adjustments (inventory corrections)
        for _ in range(random.randint(8, 15)):
            product = random.choice(active_products)
            adjustment_qty = random.choice([-5, -3, -2, -1, 1, 2, 3, 5])
            adjustment_movement = StockMovement(
                product_id=product.id,
                movement_type=MovementType.MANUAL_ADJUSTMENT,
                quantity=adjustment_qty,
                description=random.choice([
                    "Sayım düzeltmesi",
                    "Envanter uyumsuzluğu düzeltildi",
                    "Sistem hatası düzeltmesi",
                    "Depo transferi"
                ]),
                created_by=random.choice(active_users).id,
                created_at=random_date(90, 5)
            )
            session.add(adjustment_movement)
        
        await session.commit()
        
        print("\n" + "="*60)
        print("✅ Realistic sample data generation completed!")
        print("="*60)
        print(f"Users: {len(users)} ({len(active_users)} active)")
        print(f"Customers: {len(customers)}")
        print(f"Products: {len(products)} ({len(active_products)} active)")
        print(f"Orders: {len(all_orders)}")
        print(f"Stock movements: Multiple types across all products")
        print("\nLogin credentials:")
        print("  Username: admin | Password: admin123")
        print("  Username: ayse.kaya | Password: pass123")
        print("  Username: ali.demir | Password: pass123")
        print("  Username: zeynep.ak | Password: pass123")
        print("  Username: can.yildirim | Password: pass123")
        print("="*60)


if __name__ == "__main__":
    asyncio.run(populate_realistic_data())
