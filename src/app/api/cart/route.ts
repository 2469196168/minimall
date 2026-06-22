import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { addCartItemSchema, updateCartItemSchema } from "@/lib/validations";

/**
 * GET /api/cart — 获取当前用户的购物车列表
 * 返回购物车条目及关联的商品信息
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

    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            inventory: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json(
      { success: false, error: "获取购物车失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart — 添加商品到购物车
 * Body: { productId: string, quantity: number }
 * 若商品已在购物车中，则累加数量
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
    const parsed = addCartItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { productId, quantity } = parsed.data;

    // 验证商品存在且上架
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: "商品不存在或已下架" },
        { status: 400 }
      );
    }

    // 检查库存
    if (product.inventory < quantity) {
      return NextResponse.json(
        { success: false, error: `库存不足，当前库存 ${product.inventory} 件` },
        { status: 400 }
      );
    }

    // 查找用户购物车中是否已有该商品
    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    let cartItem;
    if (existing) {
      // 已存在 → 累加数量（但不超过库存）
      const newQuantity = Math.min(existing.quantity + quantity, product.inventory);
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: true,
              inventory: true,
              isActive: true,
            },
          },
        },
      });
    } else {
      // 不存在 → 新建
      cartItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          quantity,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: true,
              inventory: true,
              isActive: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ success: true, data: cartItem });
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json(
      { success: false, error: "添加到购物车失败" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/cart — 更新购物车商品数量
 * Body: { productId: string, quantity: number }
 * quantity 为 0 时删除该条目
 */
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updateCartItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { productId, quantity } = parsed.data;

    // 查找该用户的购物车条目
    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "购物车中无此商品" },
        { status: 404 }
      );
    }

    // quantity 为 0 → 删除
    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, data: null });
    }

    // 验证库存
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (product && quantity > product.inventory) {
      return NextResponse.json(
        { success: false, error: `库存不足，当前库存 ${product.inventory} 件` },
        { status: 400 }
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            inventory: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Cart PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "更新购物车失败" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart?productId=xxx — 从购物车移除商品
 */
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "请指定商品ID" },
        { status: 400 }
      );
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "购物车中无此商品" },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({ where: { id: existing.id } });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "移除商品失败" },
      { status: 500 }
    );
  }
}
