from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv(Path(__file__).resolve().parent / ".env")

from core.config import settings
from langgraph.checkpoint.postgres import PostgresSaver
from sqlalchemy.engine import make_url

from app.app import CustomerSupportAgent


@asynccontextmanager
async def lifespan(app: FastAPI):
    database_url = make_url(settings.DATABASE_URL).set(drivername="postgresql")
    with PostgresSaver.from_conn_string(
        database_url.render_as_string(hide_password=False)
    ) as checkpointer:
        checkpointer.setup()
        app.state.support_agent = CustomerSupportAgent(checkpointer=checkpointer)
        yield


app = FastAPI(
    title="CS",
    description="Customer Support",
    version="1.0.0",
    lifespan=lifespan,
)
from app.router import router

app.include_router(router)
