"use client";

import Link from "next/link";
import { useWishlist } from "@/hooks/useWishlist";

/**
 * 收藏图标 + 数量 Badge
 * 在 Header 中使用，实时显示收藏数
 */
export default function WishlistBadge() {
  const { items } = useWishlist();

  return (
    <Link href="/wishlist" className="relative text-gray-600 hover:text-red-500">
      ♡ 收藏
      {items.length > 0 && (
        <span className="absolute -right-3 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {items.length > 99 ? "99+" : items.length}
        </span>
      )}
    </Link>
  );
}
