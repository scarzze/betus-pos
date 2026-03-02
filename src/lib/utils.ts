// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as currency (KES)
 */
export function formatCurrency(amount: number) {
  return `KES ${amount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date to readable string
 */
export function formatDate(dateStr: string | Date) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
}

/**
 * Generate random SKU (optional auto-generation helper)
 */
export function generateSKU(prefix = "VIN") {
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit
  return `${prefix}-${random}`;
}

/**
 * Receipt helper: generate text receipt for a sale
 */
export function generateReceipt(sale: {
  id: string;
  customer?: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  date: string;
}) {
  const lines = [
    "=== VinLex Electronics POS ===",
    `Receipt #: ${sale.id}`,
    `Date: ${formatDate(sale.date)}`,
    sale.customer ? `Customer: ${sale.customer}` : "",
    "------------------------------",
  ];
  sale.items.forEach((item) => {
    lines.push(`${item.name} x${item.qty} - ${formatCurrency(item.price * item.qty)}`);
  });
  lines.push("------------------------------");
  lines.push(`TOTAL: ${formatCurrency(sale.total)}`);
  lines.push("==============================");
  return lines.join("\n");
}

/**
 * Simple helper to calculate margin %
 */
export function calculateMargin(buyingPrice: number, sellingPrice: number) {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - buyingPrice) / sellingPrice) * 100;
}
