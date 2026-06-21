"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

/**
 * 移动端汉堡菜单 + 侧滑导航面板
 * 仅在 md 以下显示（md:hidden）
 */
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { totalCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setOpen(false);
    }
  };

  return (
    <>
      {/* 汉堡按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
        aria-label="打开菜单"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* 遮罩层 */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 transition-opacity md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 侧滑面板 */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-72 bg-white shadow-xl transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <span className="text-lg font-bold text-indigo-600">🛍️ Mini Mall</span>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="关闭菜单"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 搜索 */}
        <div className="px-4 py-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索商品..."
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              🔍
            </button>
          </form>
        </div>

        {/* 导航链接 */}
        <nav className="flex flex-col gap-1 px-3">
          <Link
            href="/products"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span className="text-lg">🛒</span>
            全部商品
          </Link>

          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span className="text-lg">🛍️</span>
            购物车
            {totalCount > 0 && (
              <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                {totalCount > 99 ? "99+" : totalCount}
              </span>
            )}
          </Link>

          <Link
            href="/wishlist"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span className="text-lg">♥</span>
            我的收藏
            {wishlistItems.length > 0 && (
              <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                {wishlistItems.length > 99 ? "99+" : wishlistItems.length}
              </span>
            )}
          </Link>

          <Link
            href="/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span className="text-lg">📦</span>
            我的订单
          </Link>

          <div className="mx-3 my-2 border-t border-gray-100" />

          {user ? (
            <>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span className="text-lg">👤</span>
                个人中心
              </Link>

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  <span className="text-lg">⚙️</span>
                  管理后台
                </Link>
              )}
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mx-3 mt-2 block rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-indigo-700"
            >
              登录 / 注册
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}
