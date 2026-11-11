import os

class Settings:
    PROJECT_NAME: str = "QuantumLens API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./quantumlens.db")
    CORS_ORIGINS: list = ["*"]
    RANDOM_STATE: int = 42

settings = Settings()
