from fastapi import HTTPException
from langchain_core.runnables import RunnableConfig

from ai.app.schemas.enums import AgentInterruptEnum


class AskService:
    def __init__(self) -> None:
        pass

    def validate_state(self, state, user_id: int) -> None:
        owner_id = (state.metadata or {}).get("user_id")

        if state.values and owner_id is not None and owner_id != user_id:
            raise HTTPException(
                status_code=403, detail="Thread belongs to another user"
            )
        if state.interrupts:
            raise HTTPException(
                status_code=409,
                detail="Confirm or decline the pending cancellation first",
            )

    def get_config(self, conversation_id: str, user_id: int) -> RunnableConfig:
        return {
            "configurable": {"thread_id": conversation_id},
            "metadata": {"user_id": user_id},
        }

    def agent_response(self, response: dict, thread_id: str) -> dict:
        interruptions = response.get("__interrupt__", ())
        if interruptions:
            pending = interruptions[0]
            value = pending.value
            if (
                not isinstance(value, dict)
                or value.get("type")
                != AgentInterruptEnum.OrderCancellationConfirmation.value
            ):
                raise HTTPException(
                    status_code=500, detail="Unsupported agent interruption"
                )
            return {
                "message": value["message"],
                "blocks": [],
                "confirmation": {
                    **value,
                    "thread_id": thread_id,
                    "interrupt_id": pending.id,
                },
            }

        result = response["structured_response"]
        return (
            result.model_dump(mode="json") if hasattr(result, "model_dump") else result
        )
