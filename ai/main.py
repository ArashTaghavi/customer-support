from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv(Path(__file__).resolve().parent / ".env")

app = FastAPI(title="CS", description="Customer Support", version="1.0.0")
from app.router import router

app.include_router(router)
