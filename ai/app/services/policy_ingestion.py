from typing import cast

from app.schemas.requests.policy_ingest_request import PolicyIngestRequest
from app.schemas.responses import SuccessResponse
from core.database import DbSession
from core.vector_store import vector_store
from langchain_core.documents import Document
from sqlalchemy import text


class PolicyIngestionService:
    def ingest_all(self, db: DbSession):
        policies = db.execute(text("""
        SELECT
            p.id,
            p.content,
            pc.name AS category_name
        FROM policies p
        JOIN policy_categories pc
            ON pc.id = p.policy_category_id
    """)).mappings().all()

        store = vector_store.get_vector_store(collection_name="policies")

        store.delete_collection()

        store = vector_store.get_vector_store(collection_name="policies")

        documents = [
            self._prepare_document(policy=cast(PolicyIngestRequest, policy))
            for policy in policies
        ]

        store.add_documents(
            documents=documents,
            ids=[f"policy:{document.metadata['policy_id']}" for document in documents],
        )

    def ingest_one(self, policy: PolicyIngestRequest):
        try:
            store = vector_store.get_vector_store(collection_name="policies")
            store.add_documents(documents=[self._prepare_document(policy=policy)])
            return SuccessResponse(message="Policy embedding created successfully.")

        except Exception as e:
            raise RuntimeError(
                f"Failed to create embedding for policy {policy.id}"
            ) from e

    @staticmethod
    def _prepare_document(policy: PolicyIngestRequest) -> Document:
        return Document(
            page_content=policy.content,
            metadata={
                "policy_id": policy.id,
                "category_name": policy.category_name,
            },
        )
