from typing import Annotated, Literal

from pydantic import BaseModel, Field, field_validator


class ProductReference(BaseModel):
    id: int = Field(gt=0, description="The exact product ID returned by a tool.")


class ProductsBlock(BaseModel):
    type: Literal["products"] = "products"
    data: list[ProductReference]

    @field_validator("data", mode="before")
    @classmethod
    def normalize_single_product(cls, value: object) -> object:
        if isinstance(value, dict) and "id" in value:
            return [value]
        return value


class OrderReference(BaseModel):
    id: int = Field(gt=0, description="The exact order ID returned by a tool.")


class OrderBlock(BaseModel):
    type: Literal["order"] = "order"
    data: OrderReference


class ChatResponse(BaseModel):
    message: str = Field(
        description=(
            "A brief, user-friendly response in the user's language. "
            "For products and orders, briefly introduce the result. "
            "For general questions or action outcomes, answer directly."
        )
    )
    blocks: list[Annotated[ProductsBlock | OrderBlock, Field(discriminator="type")]] = Field(
        default_factory=list,
        description=(
            "Only products and order blocks are supported. Include only IDs "
            "returned by tools; the frontend fetches all details separately. "
            "For multiple orders, use one order block per order. "
            "For statistics or results without an order/product ID, return []. "
            "Never invent IDs or include prices, addresses, statuses, or timestamps."
        ),
    )
