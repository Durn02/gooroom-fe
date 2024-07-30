from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from domain.api import router as domain_api_router
from utils import Logger
from config.connection import create_ssh_tunnel
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from domain.service.friend.friend import delete_knock_links
from domain.service.content.content import delete_old_stickers, delete_old_casts

scheduler = AsyncIOScheduler()
logger = Logger("main.py")
tunnel = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global tunnel
    tunnel = create_ssh_tunnel()
    tunnel.start()
    logger.info("SSH 터널이 시작되었습니다. Neptune 데이터베이스에 연결합니다...")
    scheduler.start()
    logger.info("스케줄러가 실행되었습니다.")
    scheduler.add_job(func=delete_old_stickers, trigger="cron", hour=0, minute=0)
    scheduler.add_job(func=delete_old_casts, trigger="cron", minute="*/30")
    scheduler.add_job(func=delete_knock_links, trigger="cron", hour="*/1")
    yield
    tunnel.stop()
    logger.info("SSH 터널이 종료되었습니다.")
    scheduler.shutdown()
    logger.info("스케줄러가 종료되었습니다.")


app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://127.0.0.1",
    "http://127.0.0.1:8000",
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
