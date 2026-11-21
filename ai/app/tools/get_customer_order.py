from datetime import date, datetime, time, timedelta
from typing import Literal

from core.database import SessionLocal
from langchain.tools import ToolRuntime, tool
from sqlalchemy import bindparam, text

from ..context import CustomerSupportContext
from ..schemas.responses import ErrorResponse, NotFoundResponse


@tool
def get_customer_order(
    runtime: ToolRuntime[CustomerSupportContext],
    order_identifier: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    order_status: (
        Literal["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] | None
    ) = None,
    payment_status: Literal["UNPAID", "PAID", "FAILED", "REFUNDED"] | None = None,
) -> dict | list[dict]:
    """Retrieve one or all of the authenticated customer's complete orders.

    Use this tool when the customer requests full order information,
    a complete order summary, all orders, or orders filtered by status or date.
    With an identifier, return a single order; otherwise return a list.
    For cancelled orders use CANCELLED; delivered orders use DELIVERED;
    successfully paid orders use payment_status=PAID. If "successful" is
    ambiguous, ask whether the customer means paid or delivered orders.
    PROCESSING means being prepared; SHIPPED means dispatched/in transit.
    Only apply filters requested by the customer.

    The tool returns all available order information, including order
    status, shipping details, purchased products, prices, and payments.

    Present the information comprehensively and in a well-organized format.
    Include all relevant details from the returned data.

    Use get_customer_order_stats for counts, total spending, averages,
    refunds, or other aggregate statistics instead of calculating them
    from this list. For multiple orders, return one order block per order.

    Resolve relative periods using the current local date in the system
    prompt. For Persian requests, weeks begin on Saturday. This week ends
    today; last week is the previous complete Saturday-Friday week.
    The last two months is a rolling two-calendar-month interval through
    today, clamping the start day to the month's last valid day.
    Ask for clarification if the requested calendar or period is ambiguous.

    Never invent missing information or expose another customer's order.

    Args:
        order_identifier: Optional order number or shipping tracking code.
        start_date: Inclusive order creation date in Gregorian YYYY-MM-DD.
        end_date: Inclusive order creation date in Gregorian YYYY-MM-DD.
            Dates filter order creation, not payment dates. Omit dates only
            when no explicit or relative period is requested.
        order_status: Optional order status filter.
        payment_status: Optional order payment status filter, not a filter
            on individual payment records.
    """

    if order_identifier is not None:
        order_identifier = order_identifier.strip()
        if not order_identifier:
            return ErrorResponse(message="invalid_order_identifier").model_dump()

    context = runtime.context
    user_id = context.get("user_id") if isinstance(context, dict) else None

    if not isinstance(user_id, int) or user_id <= 0:
        return ErrorResponse(
            message="Invalid or missing user_id in agent context"
        ).model_dump()

    if start_date and end_date and start_date > end_date:
        return ErrorResponse(message="invalid_date_range").model_dump()
    if end_date == date.max:
        return ErrorResponse(message="invalid_end_date").model_dump()
    if order_status is not None and order_status not in {
        "PENDING",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
    }:
        return ErrorResponse(message="invalid_order_status").model_dump()
    if payment_status is not None and payment_status not in {
        "UNPAID",
        "PAID",
        "FAILED",
        "REFUNDED",
    }:
        return ErrorResponse(message="invalid_payment_status").model_dump()

    filters = ["user_id = :user_id"]
    parameters = {"user_id": user_id}
    if order_identifier is not None:
        filters.append("(order_number = :identifier OR tracking_code = :identifier)")
        parameters["identifier"] = order_identifier
    if order_status:
        filters.append("order_status = :order_status")
        parameters["order_status"] = order_status
    if payment_status:
        filters.append("payment_status = :payment_status")
        parameters["payment_status"] = payment_status
    if start_date:
        filters.append("created_at >= :start_date")
        parameters["start_date"] = datetime.combine(start_date, time.min)
    if end_date:
        filters.append("created_at < :end_date")
        parameters["end_date"] = datetime.combine(end_date + timedelta(days=1), time.min)
    where_clause = " AND ".join(filters)
    sorting = "LIMIT 1" if order_identifier is not None else "ORDER BY id DESC"

    with SessionLocal() as db:
        orders = (
            db.execute(
                text(f"""
                    SELECT id, user_id, order_number, tracking_code,
                           order_status, payment_status, total_amount,
                           shipping_address, paid_at, shipped_at, delivered_at,
                           cancelled_at, cancellation_reason, created_at, updated_at
                    FROM orders
                    WHERE {where_clause}
                    {sorting}
                """),
                parameters,
            )
            .mappings()
            .all()
        )

        if not orders:
            if order_identifier is not None:
                return NotFoundResponse(message="Order not found").model_dump()
            return []

        order_ids = [order["id"] for order in orders]

        items = (
            db.execute(
                text("""
                    SELECT oi.id, oi.order_id, oi.product_id,
                           p.title AS product_title, oi.quantity,
                           oi.unit_price, oi.total_price
                    FROM order_items AS oi
                    LEFT JOIN products AS p ON p.id = oi.product_id
                    WHERE oi.order_id IN :order_ids
                    ORDER BY oi.id
                """).bindparams(bindparam("order_ids", expanding=True)),
                {"order_ids": order_ids},
            )
            .mappings()
            .all()
        )

        payments = (
            db.execute(
                text("""
                    SELECT id, order_id, amount, status, method,
                           transaction_id, reference_id, paid_at, refunded_at,
                           failure_reason, created_at, updated_at
                    FROM payments
                    WHERE order_id IN :order_ids
                    ORDER BY id DESC
                """).bindparams(bindparam("order_ids", expanding=True)),
                {"order_ids": order_ids},
            )
            .mappings()
            .all()
        )

        result = {
            order["id"]: {**dict(order), "items": [], "payments": []}
            for order in orders
        }
        for item in items:
            result[item["order_id"]]["items"].append(dict(item))
        for payment in payments:
            result[payment["order_id"]]["payments"].append(dict(payment))

        if order_identifier is not None:
            return result[orders[0]["id"]]
        return list(result.values())
