from fastapi import APIRouter

from app.api.v1.endpoints import (
    about,
    admin_about,
    admin_contact,
    admin_notifications,
    admin_orders,
    admin_services,
    checkout,
    contact,
    orders,
    services,
    webhooks,
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(services.router)
api_router.include_router(orders.router)
api_router.include_router(checkout.router)
api_router.include_router(webhooks.router)
api_router.include_router(contact.router)
api_router.include_router(about.router)
api_router.include_router(admin_services.router)
api_router.include_router(admin_contact.router)
api_router.include_router(admin_about.router)
api_router.include_router(admin_orders.router)
api_router.include_router(admin_notifications.router)
