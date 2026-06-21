import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { couponValidateSchema } from "@/lib/validations";
import { calcDiscount } from "@/lib/utils";

/**
 * POST /api/coupons/validate — 校验优惠码并计算折扣
 * Body: { code: string, orderAmount: number }
 * 返回优惠券信息和可抵扣金额
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
    const parsed = couponValidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { code, orderAmount } = parsed.data;

    // 查找优惠券
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "优惠券不存在" },
        { status: 404 }
      );
    }

    // 验证有效性
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: "优惠券已失效" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now < coupon.validFrom) {
      return NextResponse.json(
        { success: false, error: "优惠券尚未生效" },
        { status: 400 }
      );
    }

    if (now > coupon.validUntil) {
      return NextResponse.json(
        { success: false, error: "优惠券已过期" },
        { status: 400 }
      );
    }

    // 检查使用次数
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: "优惠券已领完" },
        { status: 400 }
      );
    }

    // 检查最低订单金额
    if (orderAmount < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `订单满 ¥${coupon.minOrderAmount.toFixed(2)} 才可使用此优惠券`,
        },
        { status: 400 }
      );
    }

    // 计算折扣
    const discount = calcDiscount(coupon, orderAmount);

    return NextResponse.json({
      success: true,
      data: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        minOrderAmount: coupon.minOrderAmount,
        discount,
      },
    });
  } catch (error) {
    console.error("Coupon validate error:", error);
    return NextResponse.json(
      { success: false, error: "校验优惠券失败" },
      { status: 500 }
    );
  }
}
