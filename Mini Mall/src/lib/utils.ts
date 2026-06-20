/**
 * Merge class names (simplified version, no external dependency needed)
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Format price to CNY
 */
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`;
}

/**
 * Generate slug from string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Generate order number: yyyyMMddHHmmss-随机4位
 */
export function generateOrderNo(): string {
  const now = new Date();
  const datePart = now
    .toISOString()
    .replace(/[-:T.]/g, "")
    .slice(0, 14);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${datePart}-${random}`;
}

/**
 * Calculate discount amount from coupon
 */
export function calcDiscount(
  coupon: {
    type: string;
    value: number;
    minOrderAmount: number;
  },
  orderAmount: number
): number {
  if (orderAmount < coupon.minOrderAmount) return 0;

  if (coupon.type === "FIXED") {
    return Math.min(coupon.value, orderAmount);
  }
  if (coupon.type === "PERCENT") {
    return Math.round(orderAmount * coupon.value * 100) / 100;
  }
  return 0;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}
