import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

/**
 * GET /api/admin/products/[id] — 商品详情
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!product) {
      return NextResponse.json(
        { success: false, error: "商品不存在" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Admin product GET error:", error);
    return NextResponse.json(
      { success: false, error: "获取商品详情失败" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/products/[id] — 更新商品
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "商品不存在" },
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

    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, description, price, compareAtPrice, images, categoryId, inventory, isActive, isFeatured } = parsed.data;

    // slug 只在名称变化时更新
    let slug = existing.slug;
    if (name !== existing.name) {
      slug = slugify(name);
      const dup = await prisma.product.findFirst({
        where: { slug, id: { not: id } },
      });
      if (dup) slug = `${slug}-${Date.now().toString(36)}`;
    }

    const product = await prisma.product.update({
      where: { id },
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

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Admin product PUT error:", error);
    return NextResponse.json(
      { success: false, error: "更新商品失败" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/[id] — 删除商品
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "商品不存在" },
        { status: 404 }
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Admin product DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "删除商品失败" },
      { status: 500 }
    );
  }
}
