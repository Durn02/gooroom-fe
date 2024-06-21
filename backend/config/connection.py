import ssl
import os
from pathlib import Path
from dotenv import load_dotenv
from gremlin_python.driver import serializer
from gremlin_python.driver.client import Client
from sshtunnel import SSHTunnelForwarder
import nest_asyncio

nest_asyncio.apply()

# .env 파일 경로 설정
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# 환경 변수 설정
ssh_host = os.getenv("SSH_HOST")
ssh_port = int(os.getenv("SSH_PORT"))
ssh_user = os.getenv("SSH_USER")
ssh_key_path = os.getenv("SSH_KEY_PATH")
neptune_endpoint = os.getenv("NEPTUNE_ENDPOINT")
neptune_port = int(os.getenv("NEPTUNE_PORT"))


# SSL 설정
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE


# SSH 터널링 설정
def create_ssh_tunnel():
    tunnel = SSHTunnelForwarder(
        (ssh_host, ssh_port),
        ssh_username=ssh_user,
        ssh_private_key=ssh_key_path,
        remote_bind_address=(neptune_endpoint, neptune_port),
        local_bind_address=("localhost", 8182),
    )
    return tunnel


# Gremlin 클라이언트 설정
def create_gremlin_client():
    client = Client(
        "wss://localhost:8182/gremlin",
        "g",
        message_serializer=serializer.GraphSONSerializersV3d0(),
        ssl_context=ssl_context,  # SSL 인증서 검증 비활성화
    )
    return client
