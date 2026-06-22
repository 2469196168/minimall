import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

/**
 * GET /api/admin/categories — 管理端分类列表
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Admin categories GET error:", error);
    return NextResponse.json(
      { success: false, error: "获取分类列表失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories — 新增分类
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

    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    let slug = slugify(parsed.data.name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug,
        icon: parsed.data.icon || null,
        sortOrder: parsed.data.sortOrder,
      },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error("Admin category POST error:", error);
    return NextResponse.json(
      { success: false, error: "新增分类失败" },
      { status: 500 }
    );
  }
}
