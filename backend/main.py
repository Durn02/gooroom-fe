# app/main.py

from fastapi import FastAPI
from api.v1.api import router as api_v1_router
from config.database import connect_to_db, close_db_connection

app = FastAPI()


@app.on_event("startup")
async def startup():
    connect_to_db()


@app.on_event("shutdown")
async def shutdown():
    close_db_connection()


app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Welcome to my FastAPI application"}
