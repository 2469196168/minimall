/**
 * 简易内存频率限制器
 * 生产环境建议替换为 Redis 方案
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/** 最大存储条目数，防止 DoS 内存膨胀 */
const MAX_STORE_SIZE = 10_000;

const store = new Map<string, RateLimitEntry>();

/**
 * 清理所有已过期条目
 */
function cleanExpired(now: number): void {
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

/**
 * 检查是否超过频率限制
 * @param key — 标识符（如 IP）
 * @param maxRequests — 最大请求数
 * @param windowMs — 时间窗口（毫秒）
 * @returns { allowed, remaining, resetAt }
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // 达到上限时先清理过期条目，仍满则拒绝新条目
    if (store.size >= MAX_STORE_SIZE) {
      cleanExpired(now);
      if (store.size >= MAX_STORE_SIZE) {
        // 清理后仍满 → 临时放行但记录告警
        console.warn("[rate-limit] Store at capacity, temporarily allowing request");
        return { allowed: true, remaining: 0, resetAt: now + windowMs };
      }
    }

    // 新窗口
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

/**
 * 定期清理过期条目（每 5 分钟）
 */
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    cleanExpired(Date.now());
  }, 5 * 60 * 1000);
}
