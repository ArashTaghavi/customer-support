from datetime import datetime, timedelta, timezone
from typing import TypedDict

from core.config import settings
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware
from langchain.chat_models import init_chat_model
from langgraph.checkpoint.base import BaseCheckpointSaver

from app.schemas.responses import ChatResponse
from app.tools import search_policies, search_product

SYSTEM_PROMPT = """
You are a professional customer support agent for an online store.

Rules:
- Always respond in the user's language.
- Use available tools to retrieve products, orders, and store policies.
- Base all business-related answers on tool results.
- Never invent product prices, stock levels, order information, or store policies.
- If tools return insufficient information, explain that the information
  is unavailable and suggest contacting customer support.
- Never claim an action was completed unless confirmed by a tool.
- Do not attempt actions that are not supported by available tools.
- Ask for clarification when required information is missing.
- Keep responses clear, concise, natural, and helpful.

Order management:
- Use the appropriate tools to retrieve order details, track orders,
  place orders, and manage cancellations.
- When the customer requests order cancellation and provides an order
  number or tracking code, call cancel_order if available.
- If the order identifier is missing, ask for it first.
- Let cancel_order handle confirmation through its interrupt mechanism.
- Do not ask for cancellation confirmation yourself in a normal text
  response when the cancellation tool handles confirmation.

Response formatting:
- Always provide a user-friendly message.
- For product search results, include a products block.
- Only supported block types are products and order.
- Never emit an orders block.
- For complete details of a single order, include an order block.
- For multiple complete orders, include a separate order block for each order.
- For general questions, return an empty blocks list.
- For aggregate order statistics, use get_customer_order_stats if available
  and return an empty blocks list.
- Most/least expensive and first/latest order summaries from statistics
  belong in the message with blocks=[].
- Only include structured data supported by tool results.
"""


class CustomerSupportContext(TypedDict):
    user_id: int


class CustomerSupportAgent:
    def __init__(self, checkpointer: BaseCheckpointSaver) -> None:
        self.model = init_chat_model(
            model=settings.MODEL_NAME,
            model_provider=settings.MODEL_PROVIDER,
            temperature=settings.TEMPERATURE,
        )

        self.tools = [search_policies, search_product]

        self.agent = create_agent(
            checkpointer=checkpointer,
            model=self.model,
            tools=self.tools,
            middleware=[
                SummarizationMiddleware(
                    model=self.model,
                    trigger=("tokens", 6000),
                    keep=("messages", 10),
                    summary_prompt=(
                        "Summarize the conversation for continued customer support. "
                        "Preserve user requests, order identifiers, relevant policy facts, "
                        "tool results, completed actions, and pending issues. "
                        "Distinguish confirmed facts from user claims and pending actions. "
                        "Do not invent information.\n\n{messages}"
                    ),
                ),
            ],
            system_prompt=SYSTEM_PROMPT
            + (
                "\nCurrent local date in Asia/Tehran (UTC+03:30): "
                f"{datetime.now(timezone(timedelta(hours=3, minutes=30))):%Y-%m-%d (%A)}.\n"
                "Resolve relative date requests against this date before calling tools. "
                "Use Gregorian YYYY-MM-DD tool arguments. "
                "For Persian requests, weeks begin on Saturday. "
                "If no period is requested, omit date filters.\n"
            ),
            response_format=ChatResponse,
            context_schema=CustomerSupportContext,
        )
