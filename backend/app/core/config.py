from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = "postgresql://betus:betus@localhost:5432/betus"
    MPESA_CONSUMER_KEY: str = "AdOWXv3aRdJJcamW1thy4eldjcW2ED2QylWNPqCDKQuXAxkU"
    MPESA_CONSUMER_SECRET: str = "FGSrNkKBp49J0Emjo80jVt3Gerb9UyQzGyTL7JYz5F5uD19KbxE6d3j2fKANztYW"
    MPESA_SHORTCODE: str = "8189100"
    MPESA_PASSKEY: str = "gDoHg+BNvm8jw7JAkxs+IaS266jkQ1FLr3mL1g4NQFPippP/UjYFpxdNdYNK4Wzg0NEm5LpqOIxSbnEwsHW9wVOGxWPS/KSDXd/4N6CS7D1dlG49/2wHNNZbw6HTCXUOqS2xUza7pHq8VaWt+vAgsdbE5vTRQI/4uCtU6+xeQaE16KVBpLmDkx58OUR8KfuwAv4Db+haqDrt9UEDiAxgmcyoKAex6rEN3rbcWCoemld+Ia2ikUSO2IWHKJZ1BLt3GlVpxb/r9uytgSow7ciGp0iMLcsdb4a7YW9HUNq38PYEk/saDCOWGvDPgVQgr3nRaC7hWXk/XFGT3WgpeTl4rQ=="
    MPESA_CALLBACK_URL: str = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"
    MPESA_ENV: str = "sandbox"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
