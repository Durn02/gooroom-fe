# app/main.py

from fastapi import FastAPI
from app.api.v1.api import router as api_v1_router

app = FastAPI()

app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Welcome to my FastAPI application"}
