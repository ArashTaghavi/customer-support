from core.database import DbSession
from fastapi import APIRouter, HTTPException, Request
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.types import Command

from app.schemas.requests import (
    AskRequest,
    ConfirmCancelOrderRequest,
    PolicyIngestRequest,
)
from app.services.policy_ingestion import PolicyIngestionService

router = APIRouter(prefix="/ai")

ingestion_service = PolicyIngestionService()


def agent_response(response: dict, thread_id: str) -> dict:
    interruptions = response.get("__interrupt__", ())
    if interruptions:
        pending = interruptions[0]
        value = pending.value
        if not isinstance(value, dict) or value.get("type") != "order_cancellation_confirmation":
            raise HTTPException(status_code=500, detail="Unsupported agent interruption")
        return {
            "message": value["message"],
            "blocks": [],
            "confirmation": {**value, "thread_id": thread_id, "interrupt_id": pending.id},
        }

    result = response["structured_response"]
    return result.model_dump(mode="json") if hasattr(result, "model_dump") else result


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
    config = {
        "configurable": {"thread_id": request.conversation_id},
        "metadata": {"user_id": request.user_id},
    }
    state = agent.get_state(config)
    owner_id = (state.metadata or {}).get("user_id")
    if state.values and owner_id is not None and owner_id != request.user_id:
        raise HTTPException(status_code=403, detail="Thread belongs to another user")
    if state.interrupts:
        raise HTTPException(status_code=409, detail="Confirm or decline the pending cancellation first")

    response = agent.invoke(
        {
            "messages": [
                HumanMessage(content=request.question),
            ]
        },
        config=config,
        context={"user_id": request.user_id},
    )

    return agent_response(response, request.conversation_id)


@router.post("/confirm-cancel-order")
def confirm_cancel_order(request: ConfirmCancelOrderRequest, http_request: Request):
    agent = http_request.app.state.support_agent.agent
    config = {"configurable": {"thread_id": request.thread_id}}
    state = agent.get_state(config)
    if not state.values:
        raise HTTPException(status_code=409, detail="No pending cancellation")
    if (state.metadata or {}).get("user_id") != request.user_id:
        raise HTTPException(status_code=403, detail="Thread belongs to another user")
    pending = next((item for item in state.interrupts if item.id == request.interrupt_id), None)
    if pending is None or not isinstance(pending.value, dict) or pending.value.get("type") != "order_cancellation_confirmation":
        raise HTTPException(status_code=409, detail="Cancellation confirmation has expired")

    response = agent.invoke(
        Command(resume={request.interrupt_id: {
            "confirmed": request.confirmed,
            "order_id": pending.value["order_id"],
        }}),
        config={**config, "metadata": {"user_id": request.user_id}},
        context={"user_id": request.user_id},
    )
    result = agent_response(response, request.thread_id)
    if not response.get("__interrupt__"):
        http_request.app.state.checkpointer.delete_thread(request.thread_id)
    return result


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
