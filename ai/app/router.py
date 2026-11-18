from core.database import DbSession
from fastapi import APIRouter, HTTPException
from langchain_core.messages import HumanMessage

from app.app import CustomerSupportAgent
from app.schemas.requests import AskRequest, PolicyIngestRequest
from app.services.policy_ingestion import PolicyIngestionService

router = APIRouter(prefix="/ai")

ingestion_service = PolicyIngestionService()
app = CustomerSupportAgent()


@router.post("/health")
def health():
    pass


@router.post("/ingest-policies")
def ingest_policies(db: DbSession):
    return ingestion_service.ingest_all(db=db)


@router.post("/ingest")
def ingest(policy: PolicyIngestRequest):
    try:
        return ingestion_service.ingest_one(policy)

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/ask")
def ask(request: AskRequest):
    agent = app.agent

    response = agent.invoke(
        {
            "messages": [
                HumanMessage(content=request.question),
            ]
        }
    )

    return response["messages"][-1].content
