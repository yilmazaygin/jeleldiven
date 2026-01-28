from pydantic import BaseModel


class DashboardReport(BaseModel):
    pending_deliveries_count: int
    pending_payments_count: int
    total_revenue: float


class CustomerRevenueReport(BaseModel):
    customer_id: int
    customer_name: str
    total_revenue: float


class StockReport(BaseModel):
    product_id: int
    product_name: str
    total_stock: int
    reserved_stock: int
    available_stock: int
