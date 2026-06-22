import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

/**
 * PUT /api/admin/categories/[id] — 更新分类
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "分类不存在" },
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

    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    let slug = existing.slug;
    if (parsed.data.name !== existing.name) {
      slug = slugify(parsed.data.name);
      const dup = await prisma.category.findFirst({
        where: { slug, id: { not: id } },
      });
      if (dup) slug = `${slug}-${Date.now().toString(36)}`;
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug,
        icon: parsed.data.icon || null,
        sortOrder: parsed.data.sortOrder,
      },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Admin category PUT error:", error);
    return NextResponse.json(
      { success: false, error: "更新分类失败" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id] — 删除分类
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "分类不存在" },
        { status: 404 }
      );
    }

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        { success: false, error: `该分类下有 ${productCount} 件商品，无法删除` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Admin category DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "删除分类失败" },
      { status: 500 }
    );
  }
}
