import { NextResponse } from "next/server";
import { removeTokenCookie } from "@/lib/auth";

export async function POST() {
  try {
    await removeTokenCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "退出失败" },
      { status: 500 }
    );
  }
}
