"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";

/**
 * 购物车图标 + 数量 Badge
 * 在 Header 中使用，实时显示购物车商品数
 */
export default function CartBadge() {
  const { totalCount } = useCart();

  return (
    <Link href="/cart" className="relative text-gray-600 hover:text-indigo-600">
      🛒 购物车
      {totalCount > 0 && (
        <span className="absolute -right-3 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {totalCount > 99 ? "99+" : totalCount}
        </span>
      )}
    </Link>
  );
}
