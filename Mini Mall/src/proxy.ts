import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error("Missing JWT_SECRET environment variable. Please set it in .env file.");
}
const secret = new TextEncoder().encode(secretKey);

/**
 * 需要登录才能访问的路由前缀
 */
const PROTECTED_ROUTES = ["/cart", "/checkout", "/orders", "/wishlist", "/profile"];

/**
 * 仅管理员可访问的路由前缀
 */
const ADMIN_ROUTES = ["/admin"];

/**
 * 已登录用户不应访问的路由（登录/注册后重定向到首页）
 */
const AUTH_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 获取 Cookie 中的 token
  const token = request.cookies.get("token")?.value;

  let payload: { userId: string; role: string } | null = null;

  if (token) {
    try {
      const { payload: p } = await jwtVerify(token, secret);
      payload = p as unknown as { userId: string; role: string };
    } catch {
      // token 无效或过期
    }
  }

  const isAuthenticated = payload !== null;
  const isAdmin = payload?.role === "ADMIN";

  // 1. 管理后台：仅管理员可访问
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 2. API 路由鉴权（/api/admin/* 仅管理员）
  if (pathname.startsWith("/api/admin")) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "无权限" },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // 3. 需要登录的前台页面
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. 已登录用户访问登录/注册页 → 重定向到首页
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|uploads/).*)",
  ],
};
