from core.config import settings
from core.vector_store import vector_store
from langchain_core.tools import tool


@tool(
    description=(
        "Searches store policies about registration, purchases, "
        "shipping, cancellations, returns, refunds, and warranties. "
        "Returns relevant policy text."
    )
)
def search_policies(query: str) -> str:
    store = vector_store.get_vector_store(collection_name="policies")
    documents = store.similarity_search(
        query=query,
        k=settings.RETRIEVAL_K,
    )

    return "\n".join(document.page_content for document in documents)
