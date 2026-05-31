from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGO_URL: str = "mongodb://localhost:27017"
    REDIS_URL: str = ""
    DB_NAME: str = "legal_rag"
    OPENAI_API_KEY: str = ""
    LLM_PROVIDER: str = "ollama"
    OLLAMA_MODEL: str = "mistral"
    OLLAMA_BASE_URL: str = "http://localhost:11434/v1"

    model_config = SettingsConfigDict(
        env_file=[
            str(Path(__file__).resolve().parents[1] / ".env"),  # backend/.env
            str(Path(__file__).resolve().parents[2] / ".env"),  # repo-root .env (fallback)
        ],
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
