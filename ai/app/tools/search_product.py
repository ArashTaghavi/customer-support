from core.database import SessionLocal
from langchain_core.tools import tool
from sqlalchemy import text

from ..schemas.responses import NotFoundResponse


@tool
def search_product(query: str) -> list[dict] | dict:
    """Search the store's product catalog by product name, brand, or model.

    Use this tool when customers ask about:
    - Available products, brands, or models.
    - Product prices and stock availability.
    - Product specifications and descriptions.
    - Product comparisons and recommendations.
    - Cheapest or most expensive products.

    Query construction:
    - Extract only meaningful product search keywords.
    - Remove conversational phrases and generic shopping words.
    - Preserve brand names, model numbers, and technical specifications.
    - Translate or normalize product names when appropriate.
    - Do not include price comparisons or sorting instructions in the query.

    Examples:
    - "گوشی iphone چی داری؟" -> "iphone"
    - "آیفون چنده؟" -> "iphone"
    - "قیمت آیفون ۱۶ پرو چنده؟" -> "iphone 16 pro"
    - "گرون‌ترین آیفون چنده؟" -> "iphone"
    - "ارزون‌ترین سامسونگ رو نشون بده" -> "samsung"
    - "لپ‌تاپ ایسوس داری؟" -> "asus"
    - "آیفون با حافظه ۲۵۶ گیگ می‌خوام" -> "iphone 256GB"

    Return matching products with their actual prices, stock,
    and specifications. Never invent product information.
    """

    query = query.strip()

    if not query:
        return []

    with SessionLocal() as db:
        products = (
            db.execute(
                text("""
                SELECT id, title, description, price, stock, image
                FROM products
                WHERE deleted_at IS NULL
                  AND (
                      title ILIKE :query
                      OR description ILIKE :query
                  )
                ORDER BY id DESC
                LIMIT 10
            """),
                {"query": f"%{query}%"},
            )
            .mappings()
            .all()
        )

        if not products:
            return NotFoundResponse(message="Product not found").model_dump()

        return [dict(product) for product in products]
