from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    DATABASE_URL: str = "sqlite:///./striveai.db"
    SECRET_KEY: str = "dev-secret-key"
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    ENV: str = "development"

    # Guidance stage thresholds
    MIN_ATTEMPTS_BEFORE_FULL_SOLUTION: int = 2
    REFLECTION_TIMER_SECONDS: int = 5

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
