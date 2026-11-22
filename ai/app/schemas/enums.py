from enum import StrEnum


class OrderStatusEnum(StrEnum):
    Pending = "PENDING"
    Processing = "PROCESSING"
    Shipped = "SHIPPED"
    Delivered = "DELIVERED"
    Cancelled = "CANCELLED"


class AgentInterruptEnum(StrEnum):
    OrderCancellationConfirmation = "ORDER_CANCELLATION_CONFIRMATION"
