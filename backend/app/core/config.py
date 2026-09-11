from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "LLD Practice & Evaluation Platform"
    environment: str = "development"
    gemini_api_key: str | None = Field(default=None, validation_alias="GEMINI_API_KEY")
    # gemini-2.0-flash has been retired by the Gemini API.
    gemini_model: str = Field(default="gemini-3.6-flash", validation_alias="GEMINI_MODEL")
    gemini_fallback_model: str = Field(default="gemini-3.5-flash-lite", validation_alias="GEMINI_FALLBACK_MODEL")
    gemini_daily_limit: int = Field(default=50, validation_alias="GEMINI_DAILY_LIMIT")
    jwt_secret: str = Field(default="change-me-in-development", validation_alias="JWT_SECRET")
    cors_origins: str = Field(default="http://localhost:5173,http://localhost:3000", validation_alias="CORS_ORIGINS")
    database_url: str = Field(
        default="postgresql+asyncpg://lld_user:lld_password@postgres:5432/lld_platform",
        validation_alias="DATABASE_URL",
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
