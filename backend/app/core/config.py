from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "default-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    DATABASE_URL: str = "sqlite+aiosqlite:///./backend_db.sqlite"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
