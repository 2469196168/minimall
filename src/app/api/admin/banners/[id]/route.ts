import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bannerSchema } from "@/lib/validations";

/**
 * PUT /api/admin/banners/[id] — 更新轮播
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "轮播不存在" },
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

    const parsed = bannerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title: parsed.data.title,
        image: parsed.data.image,
        link: parsed.data.link || null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        position: parsed.data.position,
      },
    });

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error("Admin banner PUT error:", error);
    return NextResponse.json(
      { success: false, error: "更新轮播失败" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/banners/[id] — 删除轮播
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "轮播不存在" },
        { status: 404 }
      );
    }

    await prisma.banner.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Admin banner DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "删除轮播失败" },
      { status: 500 }
    );
  }
}
