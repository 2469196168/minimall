import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { addressSchema } from "@/lib/validations";

/**
 * GET /api/addresses — 获取当前用户的所有收货地址
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: addresses });
  } catch (error) {
    console.error("Addresses GET error:", error);
    return NextResponse.json(
      { success: false, error: "获取地址列表失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/addresses — 新增收货地址
 * 如果是第一个地址或 isDefault=true，自动设为默认地址
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // 检查是否是用户的第一个地址
    const count = await prisma.address.count({ where: { userId: user.id } });
    const isFirst = count === 0;

    // 如果设为默认地址，先取消其他地址的默认状态
    if (parsed.data.isDefault || isFirst) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...parsed.data,
        userId: user.id,
        isDefault: parsed.data.isDefault || isFirst,
      },
    });

    return NextResponse.json({ success: true, data: address }, { status: 201 });
  } catch (error) {
    console.error("Addresses POST error:", error);
    return NextResponse.json(
      { success: false, error: "添加地址失败" },
      { status: 500 }
    );
  }
}
