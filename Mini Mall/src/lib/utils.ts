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

/**
 * 安全解析 JSON 字符串为字符串数组
 * 用于商品图片、评价晒图等 JSON 字段
 */
export function safeParseImages(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * 计算平均评分（0-5，保留一位小数）
 * 用于商品列表、详情页、首页统一计算
 */
export function computeAvgRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((a, b) => a + b.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
