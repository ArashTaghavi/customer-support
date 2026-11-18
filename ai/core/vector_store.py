from functools import cached_property

from core.config import settings
from langchain_openai import OpenAIEmbeddings
from langchain_postgres.vectorstores import DistanceStrategy, PGVector

type CollectionMetaData = dict[str, str | int] | None


class VectorStore:

    @cached_property
    def embeddings(self) -> OpenAIEmbeddings:
        return OpenAIEmbeddings(model=settings.EMBEDDING_MODEL)

    def get_vector_store(
        self,
        collection_name: str,
        collection_metadata: CollectionMetaData = None,
    ) -> PGVector:
        return PGVector(
            embeddings=self.embeddings,
            embedding_length=settings.EMBEDDING_LENGTH,
            connection=settings.DATABASE_URL,
            collection_name=collection_name,
            collection_metadata=collection_metadata,
            distance_strategy=DistanceStrategy.COSINE,
            use_jsonb=True,
            pre_delete_collection=False,
            create_extension=True,
        )


vector_store = VectorStore()
