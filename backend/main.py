from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from domain.api import router as domain_api_router
from domain.service.content.content import delete_old_stickers, delete_old_casts
from utils import Logger
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()
logger = Logger("main.py")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("서버 실행")
    scheduler.start()
    logger.info("스케줄러가 실행되었습니다.")
    scheduler.add_job(func=delete_old_stickers, trigger="cron", hour=0, minute=0)
    scheduler.add_job(func=delete_old_casts, trigger="cron", minute="*/30")
    yield
    scheduler.shutdown()
    logger.info("스케줄러가 종료되었습니다. 안녕~")
    logger.info("서버 종료")


app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://127.0.0.1",
    "http://127.0.0.1:8000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(domain_api_router, prefix="/domain")


@app.get("/")
async def root():
    return {"message": "Welcome to my FastAPI application"}
