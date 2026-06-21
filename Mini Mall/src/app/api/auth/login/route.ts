import { NextResponse } from "next/server";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, setTokenCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

// 登录频率限制：每 IP 每分钟最多 5 次
const LOGIN_RATE_LIMIT = 5;
const LOGIN_RATE_WINDOW = 60 * 1000; // 1 分钟

export async function POST(request: Request) {
  try {
    // 频率限制
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(`login:${ip}`, LOGIN_RATE_LIMIT, LOGIN_RATE_WINDOW);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `登录尝试过于频繁，请 ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} 秒后再试`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Zod 校验
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // 查找用户
    const user = await prisma.user.findUnique({ where: { email: email.trim() } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 签发 JWT 并写入 Cookie
    const token = await signToken({ userId: user.id, role: user.role });
    await setTokenCookie(token);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "登录失败，请稍后再试" },
      { status: 500 }
    );
  }
}
