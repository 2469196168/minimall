import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { couponSchema } from "@/lib/validations";

/**
 * GET /api/admin/coupons — 管理端优惠券列表
 */
export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: coupons });
  } catch (error) {
    console.error("Admin coupons GET error:", error);
    return NextResponse.json(
      { success: false, error: "获取优惠券列表失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/coupons — 新增优惠券
 */
export async function POST(request: Request) {
  try {
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

    // 检查 code 唯一性
    const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "优惠码已存在" },
        { status: 409 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: parsed.data.code,
        name: parsed.data.name,
        type: parsed.data.type,
        value: parsed.data.value,
        minOrderAmount: parsed.data.minOrderAmount,
        usageLimit: parsed.data.usageLimit,
        validFrom: parsed.data.validFrom ? new Date(parsed.data.validFrom) : new Date(),
        validUntil: new Date(parsed.data.validUntil),
      },
    });

    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch (error) {
    console.error("Admin coupon POST error:", error);
    return NextResponse.json(
      { success: false, error: "新增优惠券失败" },
      { status: 500 }
    );
  }
}
