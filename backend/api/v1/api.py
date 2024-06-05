# app/api/v1/api.py

from fastapi import APIRouter
from app.api.v1.endpoints.auth import subdomain as domain1_subdomain
from app.api.v1.endpoints.user import subdomain as domain2_subdomain

router = APIRouter()

router.include_router(domain1_subdomain.router, prefix="/domain1", tags=["domain1"])
router.include_router(domain2_subdomain.router, prefix="/domain2", tags=["domain2"])
