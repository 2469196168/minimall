import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

/**
 * GET /api/admin/products — 管理端商品列表
 * 支持 ?search=xxx&categoryId=xxx&isActive=true&page=1
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("isActive");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "12")));

    const where: Record<string, unknown> = {};
    if (search) where.name = { contains: search };
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== null && isActive !== "") where.isActive = isActive === "true";

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true } },
          _count: { select: { reviews: true, orderItems: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { items: products, total, page, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("Admin products GET error:", error);
    return NextResponse.json(
      { success: false, error: "获取商品列表失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products — 新增商品
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

    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, description, price, compareAtPrice, images, categoryId, inventory, isActive, isFeatured } = parsed.data;

    // 生成 slug
    let slug = slugify(name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        compareAtPrice: compareAtPrice || null,
        images: images || "[]",
        categoryId: categoryId || null,
        inventory,
        isActive,
        isFeatured,
      },
      include: { category: { select: { name: true } } },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("Admin product POST error:", error);
    return NextResponse.json(
      { success: false, error: "新增商品失败" },
      { status: 500 }
    );
  }
}
