from datetime import datetime
from typing import TypeVar

from pydantic import BaseModel, Field, computed_field

T = TypeVar("T")


class Delivered(BaseModel):
    message: str = "The order has been delivered and cannot be cancelled."
    date: datetime = Field(description="The delivery date from delivered_at.")


class Shipped(BaseModel):
    message: str = "The order has been shipped and cannot be cancelled."
    date: datetime = Field(description="The shipment date from shipped_at.")


class Cancelled(BaseModel):
    message: str = "The order has already been cancelled."
    reason: str | None = Field(description="The reason for cancelling the order.")
    date: datetime = Field(description="The cancellation date from cancelled_at.")


class NotFound(BaseModel):
    message: str = "No order was found with this number."


class NotCancellable(BaseModel):
    status: str

    @computed_field
    @property
    def message(self) -> str:
        return (
            f"Your order is currently {self.status}. "
            "Only PENDING and PROCESSING orders can be cancelled."
        )


class InvalidCancellationConfirmation(BaseModel):
    message: str = (
        "Invalid cancellation confirmation response. "
        "The confirmation must contain a 'confirmed' field with a boolean value (true or false). "
        "The order was not cancelled."
    )


class CancellationRejected(BaseModel):
    message: str = (
        "The customer rejected the order cancellation request. "
        "The order remains unchanged."
    )


class CancellationMismatch(BaseModel):
    message: str = (
        "The confirmed order ID does not match the order ID requested for cancellation. "
        "The order was not cancelled."
    )


class CancellationSucceeded(BaseModel):
    message: str = (
        "The order has been successfully cancelled. "
        "No refund was issued, and the payment status remains unchanged."
    )
    data: dict
