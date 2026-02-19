import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
MPESA_CONSUMER_KEY = os.getenv("ARf9KGvNHQ6WqUNUxZMKCM3gGgeDHOBEIjFyz8QHAEBKOXrW")
MPESA_CONSUMER_SECRET = os.getenv("1hQGqJG2GPCPjtqvj8PZEQGGpEyn8sphCLpH2ERX2e9H9pOcDdbxoxJLC2aA4Aqh")
MPESA_SHORTCODE = os.getenv("8189100")
MPESA_PASSKEY = os.getenv("MPESA_PASSKEY")
CALLBACK_URL = os.getenv("CALLBACK_URL")
