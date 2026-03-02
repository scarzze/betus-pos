from datetime import datetime
from typing import List

def generate_receipt(sale_id: str, items: List[dict], total: float, shop_name: str):
    lines = [f"--- {shop_name} RECEIPT ---"]
    lines.append(f"Date: {datetime.utcnow().isoformat()}")
    lines.append(f"Sale ID: {sale_id}")
    lines.append("\nItems:")
    for item in items:
        lines.append(f"{item['name']} x{item['quantity']} @ {item['price']} = {item['quantity']*item['price']}")
    lines.append(f"\nTotal: {total}")
    lines.append("--- THANK YOU ---")
    return "\n".join(lines)
