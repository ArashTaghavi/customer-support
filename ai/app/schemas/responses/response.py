from typing import Generic, TypeVar

from openai import BaseModel

T = TypeVar("T")


class DataResponse(BaseModel, Generic[T]):
    status: str = "success"
    data: T


class SuccessResponse(BaseModel):
    status: str = "success"
    message: str = "Request completed successfully."


class NotFoundResponse(BaseModel):
    status: str = "not_found"
    message: str = "The requested resource was not found."


class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
