from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    conversation_id: str = Field(min_length=1)
    question: str = Field(min_length=1)
