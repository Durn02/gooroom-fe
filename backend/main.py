from fastapi import FastAPI
import uvicorn
from domain.api import router as domain_api_router
from config.connection import create_ssh_tunnel
from utils.logger import Logger

app = FastAPI()
logger = Logger("main").get_logger()

tunnel = None


@app.on_event("startup")
async def startup_event():
    logger.info("FastAPI 서버 시작")
    global tunnel
    tunnel = create_ssh_tunnel()
    tunnel.start()
    logger.info("SSH 터널 시작")


@app.on_event("shutdown")
async def close_ssh_tunnel():
    global tunnel
    tunnel.stop()
    logger.info("SSH 터널 종료")


app.include_router(domain_api_router, prefix="/domain")


@app.get("/")
async def root():
    return {"message": "Welcome to my FastAPI application"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="localhost",
        port=8000,
        log_level="warning",
        reload=True,
        loop="asyncio",
    )
