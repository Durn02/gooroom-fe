# app/api/v1/api.py

from fastapi import APIRouter
from api.v1.auth import auth_example as domain1_subdomain
from api.v1.user import user_example as domain2_subdomain

router = APIRouter()

router.include_router(domain1_subdomain.router, prefix="/domain1", tags=["domain1"])
router.include_router(domain2_subdomain.router, prefix="/domain2", tags=["domain2"])
