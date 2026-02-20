import random
import string


def generate_sku(name: str) -> str:
    # Example: PROD-<4 random letters>-<4 random digits>
    letters = ''.join(random.choices(string.ascii_uppercase, k=4))
    digits = ''.join(random.choices(string.digits, k=4))
    prefix = ''.join([c.upper() for c in name[:3] if c.isalpha()])
    return f"{prefix}-{letters}-{digits}"
