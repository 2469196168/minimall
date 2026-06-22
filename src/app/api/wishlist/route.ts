import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { wishlistToggleSchema } from "@/lib/validations";

/**
 * GET /api/wishlist — 获取当前用户的收藏列表
 * 返回收藏条目及关联的商品信息
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

    const items = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            compareAtPrice: true,
            images: true,
            salesCount: true,
            isActive: true,
            reviews: {
              select: { rating: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json(
      { success: false, error: "获取收藏列表失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist — 收藏/取消收藏商品（Toggle 模式）
 * Body: { productId: string }
 * - 若未收藏 → 创建收藏条目
 * - 若已收藏 → 删除收藏条目
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
    const parsed = wishlistToggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { productId } = parsed.data;

    // 验证商品存在
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return NextResponse.json(
        { success: false, error: "商品不存在" },
        { status: 400 }
      );
    }

    // 查找是否已收藏
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existing) {
      // 已收藏 → 取消
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({
        success: true,
        data: { wished: false },
      });
    } else {
      // 未收藏 → 添加
      await prisma.wishlistItem.create({
        data: {
          userId: user.id,
          productId,
        },
      });
      return NextResponse.json({
        success: true,
        data: { wished: true },
      });
    }
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json(
      { success: false, error: "操作失败" },
      { status: 500 }
    );
  }
}
