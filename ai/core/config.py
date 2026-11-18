from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    OPENAI_API_KEY: str
    OPENAI_BASE_URL: str

    MODEL_NAME: str = "gpt-4o-mini"
    MODEL_PROVIDER: str = "openai"
    TEMPERATURE: float = 0.0

    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_LENGTH: int = 1536

    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200

    RETRIEVAL_K: int = 4

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[1] / ".env",
        env_file_encoding="utf-8-sig",
        extra="ignore",
    )


settings = Settings()  # type: ignore[call-arg]
