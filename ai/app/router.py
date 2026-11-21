from core.database import DbSession
from fastapi import APIRouter, HTTPException, Request
from langchain_core.messages import AIMessage, HumanMessage

from app.schemas.requests import AskRequest, PolicyIngestRequest
from app.services.policy_ingestion import PolicyIngestionService

router = APIRouter(prefix="/ai")

ingestion_service = PolicyIngestionService()


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
def ask(request: AskRequest, http_request: Request):
    agent = http_request.app.state.support_agent.agent

    response = agent.invoke(
        {
            "messages": [
                HumanMessage(content=request.question),
            ]
        },
        config={"configurable": {"thread_id": request.conversation_id}},
    )

    return response["structured_response"]


@router.get("/conversations/{conversation_id}/messages")
def get_messages(conversation_id: str, http_request: Request):
    agent = http_request.app.state.support_agent.agent
    state = agent.get_state({"configurable": {"thread_id": conversation_id}})

    return {
        "conversation_id": conversation_id,
        "messages": [
            message.model_dump(mode="json")
            for message in state.values.get("messages", [])
        ],
    }


@router.get("/conversations/{conversation_id}")
def messages(conversation_id: str, http_request: Request):
    agent = http_request.app.state.support_agent.agent

    state = agent.get_state({"configurable": {"thread_id": conversation_id}})

    messages = []

    for message in state.values.get("messages", []):
        if isinstance(message, HumanMessage):
            role = "user"
        elif isinstance(message, AIMessage) and not message.tool_calls:
            role = "assistant"
        else:
            continue

        messages.append(
            {
                "role": role,
                "content": message.content,
                "created_at": message.additional_kwargs.get("created_at"),
            }
        )

    return {
        "conversation_id": conversation_id,
        "messages": messages,
    }
