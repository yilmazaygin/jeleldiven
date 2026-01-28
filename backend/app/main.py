from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.logging import logger
from app.routers import auth, users, customers, products, orders, stock_movements, reports, health

app = FastAPI(
    title="Backend API",
    description="Stock, Order, Payment Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(customers.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(stock_movements.router)
app.include_router(reports.router)


@app.on_event("startup")
async def startup_event():
    logger.info("Application startup complete")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutdown complete")
