/**
 * 客户端 IP 提取工具
 *
 * 安全原则：只信任已知代理的 X-Forwarded-For 头。
 * 没有反向代理时，该头由客户端控制，不可信任。
 */

/**
 * 从请求头中安全提取客户端 IP
 *
 * - 设置了 TRUST_PROXY=true 时，信任 X-Forwarded-For 的最左 IP
 * - 未设置时，忽略 X-Forwarded-For，使用 X-Real-IP（Nginx 直设）或 fallback
 */
export function getClientIP(headersList: Headers): string {
  const trustProxy = process.env.TRUST_PROXY === "true";

  if (trustProxy) {
    // 在有反向代理（Nginx/Cloudflare/CDN）的环境下，信任代理头
    const forwarded = headersList.get("x-forwarded-for");
    if (forwarded) {
      // X-Forwarded-For: client, proxy1, proxy2 → 取最左（真实客户端 IP）
      const ips = forwarded.split(",");
      const clientIP = ips[0]?.trim();
      if (clientIP) return clientIP;
    }
  }

  // 直连或开发环境：X-Real-IP（Nginx 直接设置的），或回退
  const realIP = headersList.get("x-real-ip");
  if (realIP) return realIP;

  // 最终回退 — 开发环境下通常为此值
  return "127.0.0.1";
}
