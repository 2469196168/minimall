import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/orders/[id] — 获取订单详情
 * 验证订单属于当前用户
 */
export async function GET(
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

    const order = await prisma.order.findUnique({
      where: { id },
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
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            value: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "订单不存在" },
        { status: 404 }
      );
    }

    // 非管理员只能查看自己的订单
    if (user.role !== "ADMIN" && order.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "订单不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Order GET error:", error);
    return NextResponse.json(
      { success: false, error: "获取订单详情失败" },
      { status: 500 }
    );
  }
}

// 允许的状态流转
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

/**
 * PATCH /api/orders/[id] — 更新订单状态（模拟支付/发货/取消等）
 * Body: { status: string }
 *
 * 状态流转规则：
 * - PENDING → PAID (模拟支付)
 * - PENDING → CANCELLED (取消)
 * - PAID → SHIPPED (发货，仅 Admin)
 * - SHIPPED → DELIVERED (确认收货)
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

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json(
        { success: false, error: "订单不存在" },
        { status: 404 }
      );
    }

    const isAdmin = user.role === "ADMIN";

    // 非管理员只能操作自己的订单
    if (!isAdmin && order.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "订单不存在" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["PAID", "CANCELLED", "SHIPPED", "DELIVERED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "无效的状态" },
        { status: 400 }
      );
    }

    // 🔒 SHIPPED（发货）仅管理员可操作
    if (status === "SHIPPED" && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "无权限" },
        { status: 403 }
      );
    }

    // 验证状态流转合法性
    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `无法将订单从"${order.status}"变更为"${status}"`,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
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
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            value: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Order PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "更新订单状态失败" },
      { status: 500 }
    );
  }
}
