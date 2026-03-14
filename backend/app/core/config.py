from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours (Standard Shift)
    DATABASE_URL: str = "postgresql://betus:betus@localhost:5432/betus"
    MPESA_CONSUMER_KEY: str = "AdOWXv3aRdJJcamW1thy4eldjcW2ED2QylWNPqCDKQuXAxkU"
    MPESA_CONSUMER_SECRET: str = "FGSrNkKBp49J0Emjo80jVt3Gerb9UyQzGyTL7JYz5F5uD19KbxE6d3j2fKANztYW"
    MPESA_SHORTCODE: str = "174379"
    MPESA_PASSKEY: str = "bfb277250900d899cbc8e3282f5e35191ca973a573e14d7486a4120e493f0d87"
    MPESA_CALLBACK_URL: str = "https://unwelted-gearldine-bigamously.ngrok-free.dev/api/mpesa/callback"
    MPESA_ENV: str = "sandbox"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
