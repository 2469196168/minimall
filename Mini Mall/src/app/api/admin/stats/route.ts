import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/stats — 仪表盘统计数据
 */
export async function GET() {
  try {
    const [productCount, orderCount, userCount, recentOrders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true } },
        },
      }),
    ]);

    // 各状态订单数
    const [pendingCount, paidCount, shippedCount, deliveredCount, cancelledCount] =
      await Promise.all([
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({ where: { status: "PAID" } }),
        prisma.order.count({ where: { status: "SHIPPED" } }),
        prisma.order.count({ where: { status: "DELIVERED" } }),
        prisma.order.count({ where: { status: "CANCELLED" } }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          products: productCount,
          orders: orderCount,
          users: userCount,
          pending: pendingCount,
          paid: paidCount,
          shipped: shippedCount,
          delivered: deliveredCount,
          cancelled: cancelledCount,
        },
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          orderNo: o.orderNo,
          total: o.total,
          status: o.status,
          createdAt: o.createdAt,
          user: o.user,
        })),
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, error: "获取统计数据失败" },
      { status: 500 }
    );
  }
}
