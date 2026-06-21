import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { oldPassword, newPassword } = parsed.data;

    // 验证旧密码
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "用户不存在" },
        { status: 404 }
      );
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, currentUser.passwordHash);
    if (!isOldPasswordValid) {
      return NextResponse.json(
        { success: false, error: "旧密码不正确" },
        { status: 400 }
      );
    }

    // 新旧密码不能相同
    if (oldPassword === newPassword) {
      return NextResponse.json(
        { success: false, error: "新密码不能与旧密码相同" },
        { status: 400 }
      );
    }

    // 更新密码
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true, message: "密码修改成功" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, error: "密码修改失败，请稍后再试" },
      { status: 500 }
    );
  }
}
