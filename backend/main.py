from fastapi import FastAPI
from api.v1.api import router as api_v1_router
from config.database import connect_to_db, close_db_connection
from config.connection import NeptuneConnection

app = FastAPI()

from fastapi import FastAPI

from sshtunnel import SSHTunnelForwarder
from gremlin_python.driver import client as gremlin_client, serializer
import ssl

app = FastAPI()

# SSH 및 Neptune 설정
ssh_host = "52.78.109.39"
ssh_port = 22
ssh_user = "ec2-user"
ssh_key_path = "C:/Users/Minsoo/gooroom/ssh/test.pem"
neptune_endpoint = (
    "soohwan-cluster.cluster-c5was46486j3.ap-northeast-2.neptune.amazonaws.com"
)
neptune_port = 8182
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


def create_gremlin_client():
    client = gremlin_client.Client(
        "wss://localhost:8182/gremlin",
        "g",
        message_serializer=serializer.GraphSONSerializersV3d0(),
        ssl_context=ssl_context,  # SSL 인증서 검증 비활성화
    )
    return client


# 그래프 탐색 함수
def get_persons(gremlin_client):
    query = "g.V()"
    result = gremlin_client.submit(query).all().result()
    return result


@app.get("/persons")
async def read_persons():
    with create_ssh_tunnel() as tunnel:
        tunnel.start()
        print("SSH 터널이 시작되었습니다. Neptune 데이터베이스에 연결합니다...")

        gremlin_client = create_gremlin_client()

        try:
            persons = get_persons(gremlin_client)
            return {"persons": persons}
        finally:
            gremlin_client.close()
            tunnel.stop()
            print("SSH 터널이 종료되었습니다.")


app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Welcome to my FastAPI application"}
