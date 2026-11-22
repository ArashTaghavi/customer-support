from datetime import datetime, timedelta, timezone

from core.database import engine
from langchain.tools import ToolRuntime, tool
from langgraph.types import interrupt
from sqlalchemy import text

import app.schemas.responses.cancel_order_response as Response
from app.schemas.enums import AgentInterruptEnum, OrderStatusEnum
from app.schemas.responses.response import UnauthorizedUser

from ..context import CustomerSupportContext

CANCELLABLE_STATUSES = {
    OrderStatusEnum.Pending.value,
    OrderStatusEnum.Processing.value,
}


def get_order(user_id: int, order_identifier: str):
    with engine.connect() as db:
        return (
            db.execute(
                text("""
                    SELECT id, order_number, total_amount, order_status,
                           payment_status, shipped_at, delivered_at,
                           cancelled_at, cancellation_reason
                    FROM orders
                    WHERE user_id = :user_id
                      AND (order_number = :order_identifier OR tracking_code = :order_identifier)
                    LIMIT 1
                """),
                {"user_id": user_id, "order_identifier": order_identifier},
            )
            .mappings()
            .first()
        )


def check_order_status(order) -> dict | None:
    match order["order_status"]:
        case OrderStatusEnum.Cancelled.value:
            return Response.Cancelled(
                reason=order["cancellation_reason"],
                date=order["cancelled_at"],
            ).model_dump()

        case OrderStatusEnum.Delivered.value:
            return Response.Delivered(
                date=order["delivered_at"],
            ).model_dump()

        case OrderStatusEnum.Shipped.value:
            return Response.Shipped(
                date=order["shipped_at"],
            ).model_dump()

        case _:
            if order["order_status"] in CANCELLABLE_STATUSES:
                return None
            return Response.NotCancellable(status=order["order_status"]).model_dump()


def execute_cancellation(
    user_id: int,
    order_id: int,
    cancellation_reason: str | None,
) -> dict:
    lock_clause = "" if engine.dialect.name == "sqlite" else "FOR UPDATE"

    with engine.begin() as db:
        order = (
            db.execute(
                text(f"""
                    SELECT id, order_number, order_status, payment_status,
                           shipped_at, delivered_at, cancelled_at,
                           cancellation_reason
                    FROM orders
                    WHERE user_id = :user_id AND id = :order_id
                    {lock_clause}
                """),
                {"user_id": user_id, "order_id": order_id},
            )
            .mappings()
            .first()
        )

        if order is None:
            return Response.NotFound().model_dump()

        status_response = check_order_status(order)
        if status_response is not None:
            return status_response

        now = datetime.now(timezone(timedelta(hours=3, minutes=30))).replace(
            tzinfo=None
        )

        reason = cancellation_reason.strip() or None if cancellation_reason else None

        db.execute(
            text("""
                UPDATE orders
                SET order_status = 'CANCELLED',
                    cancelled_at = :cancelled_at,
                    cancellation_reason = :cancellation_reason
                WHERE user_id = :user_id AND id = :order_id
            """),
            {
                "user_id": user_id,
                "order_id": order_id,
                "cancelled_at": now,
                "cancellation_reason": reason,
            },
        )

        return Response.CancellationSucceeded(
            data={
                "id": order["id"],
                "order_number": order["order_number"],
                "order_status": "CANCELLED",
                "payment_status": order["payment_status"],
                "cancelled_at": now,
                "cancellation_reason": reason,
            }
        ).model_dump()


@tool(description="""Start the cancellation flow for the authenticated customer's order.

    Call this tool as soon as the customer requests cancellation and supplies
    an order number or tracking code. Do not ask the customer to confirm before
    calling it: the tool itself requests confirmation using a frontend dialog.
    Calling the tool does not immediately cancel the order.

    Only PENDING and PROCESSING orders can be cancelled. The tool requires
    explicit customer confirmation before changing the order. It pauses the graph
    with interrupt before making changes. The server must expose the interrupt
    to the customer and resume the same user-owned thread with Command(resume=...)
    containing confirmed (a boolean).
    A checkpointer and stable thread_id are required. The resume value must
    come from the customer's confirmation action, never from the model.
    Declining confirmation leaves the order unchanged. Eligibility and
    ownership are checked again after confirmation, under a database lock.

    This tool only cancels the order; it does not issue or promise refunds,
    change payment status, or restore inventory. A paid order may require
    a separate refund process. Do not report a refund as completed.

    Args:
        order_identifier: The order number or shipping tracking code.
        cancellation_reason: Optional reason provided by the customer.
    """)
def cancel_order(
    order_identifier: str,
    runtime: ToolRuntime[CustomerSupportContext],
    cancellation_reason: str | None = None,
) -> dict:
    order_identifier = order_identifier.strip()

    if not order_identifier:
        return Response.NotFound().model_dump()

    context = runtime.context
    user_id = context.get("user_id") if isinstance(context, dict) else None

    if type(user_id) is not int or user_id <= 0:
        return UnauthorizedUser().model_dump()

    order = get_order(user_id=user_id, order_identifier=order_identifier)

    if order is None:
        return Response.NotFound().model_dump()

    status_response = check_order_status(order)

    if status_response is not None:
        return status_response

    order_id = order["id"]

    confirmation = interrupt(
        {
            "type": AgentInterruptEnum.OrderCancellationConfirmation.value,
            "order_id": order_id,
            "order_number": order["order_number"],
            "total_amount": order["total_amount"],
            "message": f"آیا لغو سفارش شماره {order['order_number']} را تأیید می‌کنید؟",
        }
    )

    if (
        not isinstance(confirmation, dict)
        or type(confirmation.get("confirmed")) is not bool
    ):
        return Response.InvalidCancellationConfirmation().model_dump()

    if not confirmation["confirmed"]:
        return Response.CancellationRejected().model_dump()

    if confirmation.get("order_id") != order_id:
        return Response.CancellationMismatch().model_dump()

    return execute_cancellation(
        user_id=user_id,
        order_id=order_id,
        cancellation_reason=cancellation_reason,
    )
