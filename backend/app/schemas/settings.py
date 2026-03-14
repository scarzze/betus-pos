from pydantic import BaseModel
from typing import Optional

class SettingsBase(BaseModel):
    shop_name: Optional[str] = None
    phone_number: Optional[str] = None
    location: Optional[str] = None
    receipt_footer: Optional[str] = None
    currency: Optional[str] = None
    mpesa_till_number: Optional[str] = None
    daraja_consumer_key: Optional[str] = None
    daraja_consumer_secret: Optional[str] = None
    payment_timeout: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    sku_prefix: Optional[str] = None
    imei_tracking: Optional[bool] = None
    session_timeout: Optional[int] = None
    max_login_attempts: Optional[int] = None
    password_min_length: Optional[int] = None

class SettingsCreate(SettingsBase):
    pass

class SettingsOut(SettingsBase):
    id: int

    class Config:
        from_attributes = True
