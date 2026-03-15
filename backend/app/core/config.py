import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours (Standard Shift)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./betus.db")
    MPESA_CONSUMER_KEY: str = "AdOWXv3aRdJJcamW1thy4eldjcW2ED2QylWNPqCDKQuXAxkU"
    MPESA_CONSUMER_SECRET: str = "FGSrNkKBp49J0Emjo80jVt3Gerb9UyQzGyTL7JYz5F5uD19KbxE6d3j2fKANztYW"
    MPESA_SHORTCODE: str = "174379"
    MPESA_PASSKEY: str = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
    MPESA_CALLBACK_URL: str = "https://unwelted-gearldine-bigamously.ngrok-free.dev/api/mpesa/callback"
    MPESA_ENV: str = "sandbox"
    WEBHOOK_SECRET: str = "betus_pos_secure_123"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
