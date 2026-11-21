from datetime import date, datetime, time, timedelta
from typing import Literal

from core.database import SessionLocal
from langchain.tools import ToolRuntime, tool
from sqlalchemy import text

from ..context import CustomerSupportContext
from ..schemas.responses import ErrorResponse


@tool
def get_customer_order_stats(
    runtime: ToolRuntime[CustomerSupportContext],
    start_date: date | None = None,
    end_date: date | None = None,
    order_status: (
        Literal["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] | None
    ) = None,
    payment_status: Literal["UNPAID", "PAID", "FAILED", "REFUNDED"] | None = None,
) -> dict:
    """Retrieve aggregate order and payment statistics for the authenticated customer.

    Use for total spending, order counts by status, average order value,
    refunds, most/least expensive orders, or first/latest orders.
    Examples: "How many orders are shipping?" (SHIPPED), "How many were
    cancelled?" (CANCELLED), and "What is my most expensive order?".
    PROCESSING means being prepared; SHIPPED means dispatched/in transit.
    Only apply status filters when requested by the customer.

    Relative periods are date constraints too. Resolve expressions such as
    "the last two months", "this week", "last week", or "today" into
    Gregorian start_date/end_date using the current local date supplied in
    the system prompt. For Persian requests, weeks begin on Saturday.
    "This week" runs from Saturday through today; "last week" is the
    previous complete Saturday-Friday week. "The last two months" is a
    rolling two-calendar-month interval through today (clamp the start day
    to the last valid day of that month), not the previous two full months.
    Ask for clarification if the requested calendar or period is ambiguous.

    Return aggregates and brief summaries of first/latest and most/least
    expensive orders, never complete orders, items, or payment records.
    Use get_customer_order if full details of a specific order are requested.
    total_paid_amount includes PAID and REFUNDED payments; net_paid_amount
    subtracts refunded payments. Failed and unpaid payments are excluded.
    Answer only the customer's question using the relevant statistics.
    For statistics, respond with an empty blocks list.

    Args:
        start_date: Inclusive order creation date, in YYYY-MM-DD format.
        end_date: Inclusive order creation date, in YYYY-MM-DD format.
            Both dates filter orders by creation date, not payment date.
            Omit both dates for all-time statistics.
            Omit dates only when no explicit or relative period is requested.
        order_status: Optional order status filter applied to all statistics.
        payment_status: Optional order payment status filter applied to all
            statistics. This filters orders, not individual payment records.
    """

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

    filters = ["o.user_id = :user_id"]
    parameters = {"user_id": user_id}
    if order_status:
        filters.append("o.order_status = :order_status")
        parameters["order_status"] = order_status
    if payment_status:
        filters.append("o.payment_status = :payment_status")
        parameters["payment_status"] = payment_status
    if start_date:
        filters.append("o.created_at >= :start_date")
        parameters["start_date"] = datetime.combine(start_date, time.min)
    if end_date:
        filters.append("o.created_at < :end_date")
        parameters["end_date"] = datetime.combine(end_date + timedelta(days=1), time.min)
    where_clause = " AND ".join(filters)

    with SessionLocal() as db:
        order_count, total_order_amount = db.execute(
            text(f"""
                SELECT COUNT(o.id), COALESCE(SUM(o.total_amount), 0)
                FROM orders AS o
                WHERE {where_clause}
            """),
            parameters,
        ).one()

        order_counts_by_status = dict.fromkeys(
            ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"], 0
        )
        order_counts_by_status.update(
            db.execute(
                text(f"""
                    SELECT o.order_status, COUNT(o.id)
                    FROM orders AS o
                    WHERE {where_clause}
                    GROUP BY o.order_status
                """),
                parameters,
            ).all()
        )
        order_counts_by_payment_status = dict.fromkeys(
            ["UNPAID", "PAID", "FAILED", "REFUNDED"], 0
        )
        order_counts_by_payment_status.update(
            db.execute(
                text(f"""
                    SELECT o.payment_status, COUNT(o.id)
                    FROM orders AS o
                    WHERE {where_clause}
                    GROUP BY o.payment_status
                """),
                parameters,
            ).all()
        )

        def order_summary(sorting: str) -> dict | None:
            row = (
                db.execute(
                    text(f"""
                        SELECT o.id, o.order_number, o.total_amount,
                               o.order_status, o.payment_status, o.created_at
                        FROM orders AS o
                        WHERE {where_clause}
                        ORDER BY {sorting}
                        LIMIT 1
                    """),
                    parameters,
                )
                .mappings()
                .first()
            )
            return dict(row) if row is not None else None

        total_paid_amount, refunded_amount = db.execute(
            text(f"""
                SELECT COALESCE(SUM(CASE
                           WHEN p.status IN ('PAID', 'REFUNDED') THEN p.amount
                           ELSE 0 END), 0),
                       COALESCE(SUM(CASE
                           WHEN p.status = 'REFUNDED' THEN p.amount
                           ELSE 0 END), 0)
                FROM payments AS p
                JOIN orders AS o ON o.id = p.order_id
                WHERE {where_clause}
            """),
            parameters,
        ).one()

        return {
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat() if end_date else None,
            "date_basis": "order_created_at",
            "order_status": order_status,
            "payment_status": payment_status,
            "order_count": order_count,
            "order_counts_by_status": order_counts_by_status,
            "order_counts_by_payment_status": order_counts_by_payment_status,
            # Equal prices are resolved by order ID for consistent results.
            "most_expensive_order": order_summary("o.total_amount DESC, o.id"),
            "least_expensive_order": order_summary("o.total_amount, o.id"),
            "first_order": order_summary(
                "CASE WHEN o.created_at IS NULL THEN 1 ELSE 0 END, "
                "o.created_at ASC, o.id",
            ),
            "latest_order": order_summary(
                "CASE WHEN o.created_at IS NULL THEN 1 ELSE 0 END, "
                "o.created_at DESC, o.id DESC",
            ),
            "total_order_amount": total_order_amount,
            "average_order_amount": (
                total_order_amount / order_count if order_count else 0
            ),
            "total_paid_amount": total_paid_amount,
            "refunded_amount": refunded_amount,
            "net_paid_amount": total_paid_amount - refunded_amount,
        }
