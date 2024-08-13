import os
from pathlib import Path
from fastapi import Depends, HTTPException
from dotenv import load_dotenv

# import nest_asyncio
from utils import Logger
from neo4j import GraphDatabase

# nest_asyncio.apply()
logger = Logger("connection.py")

# .env 파일 경로 설정
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Neo4j 데이터베이스 연결 정보 설정
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE")


def get_session():
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    session = driver.session(database=NEO4J_DATABASE)
    return session
