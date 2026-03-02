import uuid

def generate_uuid() -> str:
    return str(uuid.uuid4())


def format_currency(amount: float, currency: str = "KES") -> str:
    return f"{currency} {amount:,.2f}"
