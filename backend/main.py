from fastapi import FastAPI,Depends
from domain.api import router as domain_api_router
from utils import Logger
from config.connection import create_ssh_tunnel
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

logger = Logger("main.py")
tunnel = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global tunnel
    tunnel = create_ssh_tunnel()
    tunnel.start()
    logger.info("SSH 터널이 시작되었습니다. Neptune 데이터베이스에 연결합니다...")
    yield
    tunnel.stop()
    logger.info("SSH 터널이 종료되었습니다.")

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