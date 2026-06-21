import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { addressSchema } from "@/lib/validations";

/**
 * PUT /api/addresses/[id] — 更新收货地址
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 验证地址属于当前用户
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "地址不存在" },
        { status: 404 }
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

    // 如果设为默认，取消其他地址的默认状态
    if (parsed.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Address PUT error:", error);
    return NextResponse.json(
      { success: false, error: "更新地址失败" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/addresses/[id] — 删除收货地址
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "地址不存在" },
        { status: 404 }
      );
    }

    await prisma.address.delete({ where: { id } });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("Address DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "删除地址失败" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/addresses/[id] — 设为默认地址
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "地址不存在" },
        { status: 404 }
      );
    }

    // 取消其他默认 → 设置当前为默认
    await prisma.address.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Address PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "设置默认地址失败" },
      { status: 500 }
    );
  }
}
