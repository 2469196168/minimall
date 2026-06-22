import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";

/**
 * GET /api/reviews?productId=xxx&page=1&pageSize=10 — 获取商品评价列表（公开）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const productId = searchParams.get("productId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "10")));

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "请提供商品ID" },
        { status: 400 }
      );
    }

    const where = { productId };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: reviews,
        total,
        page,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json(
      { success: false, error: "获取评价列表失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews — 发表评价
 * 规则：已登录 + 已购买该商品 + 订单状态为 DELIVERED + 未评价过
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

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "请求体格式错误" },
        { status: 400 }
      );
    }

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { productId, rating, content, images } = parsed.data;

    // 校验商品存在
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { success: false, error: "商品不存在" },
        { status: 404 }
      );
    }

    // 校验是否已评价（唯一约束）
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "您已评价过此商品" },
        { status: 409 }
      );
    }

    // 校验是否购买过且已收货
    const deliveredOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: "DELIVERED",
        items: { some: { productId } },
      },
    });
    if (!deliveredOrder) {
      return NextResponse.json(
        { success: false, error: "只有购买并收货后才可以评价" },
        { status: 403 }
      );
    }

    const review = await prisma.review.create({
      data: {
        rating,
        content: content || null,
        images: images || null,
        productId,
        userId: user.id,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error("Review POST error:", error);
    return NextResponse.json(
      { success: false, error: "发表评价失败" },
      { status: 500 }
    );
  }
}
