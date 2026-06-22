import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bannerSchema } from "@/lib/validations";

/**
 * GET /api/admin/banners — 管理端轮播列表
 */
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    console.error("Admin banners GET error:", error);
    return NextResponse.json(
      { success: false, error: "获取轮播列表失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/banners — 新增轮播
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

    const parsed = bannerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title: parsed.data.title,
        image: parsed.data.image,
        link: parsed.data.link || null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        position: parsed.data.position,
      },
    });

    return NextResponse.json({ success: true, data: banner }, { status: 201 });
  } catch (error) {
    console.error("Admin banner POST error:", error);
    return NextResponse.json(
      { success: false, error: "新增轮播失败" },
      { status: 500 }
    );
  }
}
