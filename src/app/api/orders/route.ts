import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validations";
import { generateOrderNo, calcDiscount } from "@/lib/utils";

/**
 * GET /api/orders — 获取当前用户的订单列表
 * 支持 status 查询参数筛选
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
        ...(status ? { status } : {}),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json(
      { success: false, error: "获取订单列表失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders — 创建订单（从购物车结算）
 * Body: { addressId: string, couponId?: string, note?: string }
 *
 * 事务步骤：
 * 1. 验证地址归属
 * 2. 验证并计算优惠券折扣
 * 3. 获取购物车商品
 * 4. 检查库存
 * 5. 计算总金额
 * 6. 创建订单 + 订单明细 + 扣库存 + 清购物车 + 更新优惠券使用次数
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
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { addressId, couponId, note } = parsed.data;

    // 1. 验证地址归属
    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "收货地址无效" },
        { status: 400 }
      );
    }

    // 2. 验证优惠券（如果提供）
    let coupon = null;
    let discount = 0;

    if (couponId) {
      coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
      if (!coupon || !coupon.isActive) {
        return NextResponse.json(
          { success: false, error: "优惠券无效" },
          { status: 400 }
        );
      }

      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validUntil) {
        return NextResponse.json(
          { success: false, error: "优惠券已过期" },
          { status: 400 }
        );
      }

      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json(
          { success: false, error: "优惠券已用完" },
          { status: 400 }
        );
      }
    }

    // 3. 获取购物车商品
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            inventory: true,
            isActive: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "购物车为空" },
        { status: 400 }
      );
    }

    // 4. 检查库存和下架
    for (const item of cartItems) {
      if (!item.product.isActive) {
        return NextResponse.json(
          { success: false, error: `"${item.product.name}" 已下架` },
          { status: 400 }
        );
      }
      if (item.product.inventory < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `"${item.product.name}" 库存不足（需要 ${item.quantity}，库存 ${item.product.inventory}）`,
          },
          { status: 400 }
        );
      }
    }

    // 5. 计算总金额
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // 计算优惠券折扣
    if (coupon) {
      if (subtotal < coupon.minOrderAmount) {
        return NextResponse.json(
          {
            success: false,
            error: `订单满 ¥${coupon.minOrderAmount.toFixed(2)} 才可使用此优惠券`,
          },
          { status: 400 }
        );
      }
      discount = calcDiscount(coupon, subtotal);
    }

    const total = Math.max(0, subtotal - discount);
    const orderNo = generateOrderNo();

    // 6. 事务：创建订单 + 明细 + 扣库存 + 清购物车 + 更新统计
    const order = await prisma.$transaction(async (tx) => {
      // 创建订单
      const newOrder = await tx.order.create({
        data: {
          orderNo,
          userId: user.id,
          status: "PENDING",
          total,
          addressId: address.id,
          addressSnapshot: JSON.stringify({
            name: address.name,
            phone: address.phone,
            province: address.province,
            city: address.city,
            district: address.district,
            detail: address.detail,
          }),
          couponId: coupon?.id || null,
          discount,
          note: note || null,
          items: {
            create: cartItems.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price, // 价格快照
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                },
              },
            },
          },
        },
      });

      // 扣库存 + 增销量
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.product.id },
          data: {
            inventory: { decrement: item.quantity },
            salesCount: { increment: item.quantity },
          },
        });
      }

      // 清空购物车
      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      });

      // 更新优惠券使用次数
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json(
      { success: false, error: "创建订单失败" },
      { status: 500 }
    );
  }
}
