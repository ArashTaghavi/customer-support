from pydantic import BaseModel, Field, StrictBool


class ConfirmCancelOrderRequest(BaseModel):
    thread_id: str = Field(min_length=1)
    interrupt_id: str = Field(min_length=1)
    user_id: int = Field(gt=0, strict=True)
    confirmed: StrictBool
