from fastapi import APIRouter

from app.api.v1.endpoints import admin_services, checkout, orders, services, webhooks

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(services.router)
api_router.include_router(orders.router)
api_router.include_router(checkout.router)
api_router.include_router(webhooks.router)
api_router.include_router(admin_services.router)
