import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { couponSchema } from "@/lib/validations";

/**
 * PUT /api/admin/coupons/[id] — 更新优惠券
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "优惠券不存在" },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "请求体格式错误" },
        { status: 400 }
      );
    }

    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // 检查 code 唯一性（排除自身）
    const dup = await prisma.coupon.findFirst({
      where: { code: parsed.data.code, id: { not: id } },
    });
    if (dup) {
      return NextResponse.json(
        { success: false, error: "优惠码已存在" },
        { status: 409 }
      );
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: parsed.data.code,
        name: parsed.data.name,
        type: parsed.data.type,
        value: parsed.data.value,
        minOrderAmount: parsed.data.minOrderAmount,
        usageLimit: parsed.data.usageLimit,
        validFrom: parsed.data.validFrom ? new Date(parsed.data.validFrom) : existing.validFrom,
        validUntil: new Date(parsed.data.validUntil),
      },
    });

    return NextResponse.json({ success: true, data: coupon });
  } catch (error) {
    console.error("Admin coupon PUT error:", error);
    return NextResponse.json(
      { success: false, error: "更新优惠券失败" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/coupons/[id] — 删除优惠券
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "优惠券不存在" },
        { status: 404 }
      );
    }

    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Admin coupon DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "删除优惠券失败" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/coupons/[id] — 切换启用/停用
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "优惠券不存在" },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        { success: false, error: "isActive 必须是布尔值" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: body.isActive },
    });

    return NextResponse.json({ success: true, data: coupon });
  } catch (error) {
    console.error("Admin coupon PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "操作失败" },
      { status: 500 }
    );
  }
}
