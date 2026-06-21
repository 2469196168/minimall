import { NextResponse } from "next/server";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, setTokenCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

// 注册频率限制：每 IP 每小时最多 3 次
const REGISTER_RATE_LIMIT = 3;
const REGISTER_RATE_WINDOW = 60 * 60 * 1000; // 1 小时

export async function POST(request: Request) {
  try {
    // 频率限制
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(`register:${ip}`, REGISTER_RATE_LIMIT, REGISTER_RATE_WINDOW);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `注册过于频繁，请 ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000 / 60)} 分钟后再试`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Zod 校验
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const name = parsed.data.name.trim();
    const email = parsed.data.email.trim().toLowerCase();
    const { password } = parsed.data;

    // 检查邮箱是否已注册
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    // 密码哈希
    const passwordHash = await bcrypt.hash(password, 12);

    // 创建用户
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

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
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "注册失败，请稍后再试" },
      { status: 500 }
    );
  }
}
