import { NextResponse } from "next/server";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { signToken, setTokenCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIP } from "@/lib/ip";

// 注册频率限制：每 IP 每小时最多 3 次
const REGISTER_RATE_LIMIT = 3;
const REGISTER_RATE_WINDOW = 60 * 60 * 1000; // 1 小时

export async function POST(request: Request) {
  try {
    // 频率限制 — 安全提取客户端 IP
    const headersList = await headers();
    const ip = getClientIP(headersList);

    const rateLimit = checkRateLimit(`register:${ip}`, REGISTER_RATE_LIMIT, REGISTER_RATE_WINDOW);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "注册过于频繁，请稍后再试" },
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
      // 🔒 安全：不暴露邮箱是否已存在，返回通用错误消息
      return NextResponse.json(
        { success: false, error: "注册失败，请检查输入信息" },
        { status: 400 }
      );
    }

    // 密码哈希
    const passwordHash = await bcrypt.hash(password, 12);

    try {
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
      // 竞态条件：两个请求同时注册同一邮箱 → 捕获唯一约束冲突
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json(
          { success: false, error: "注册失败，请检查输入信息" },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "注册失败，请稍后再试" },
      { status: 500 }
    );
  }
}
