import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/admin/reviews/[id] — 管理端删除评价
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json(
        { success: false, error: "评价不存在" },
        { status: 404 }
      );
    }

    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Admin review DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "删除评价失败" },
      { status: 500 }
    );
  }
}
