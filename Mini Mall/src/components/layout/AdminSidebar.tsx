"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/admin", label: "📊 仪表盘", icon: "📊" },
  { href: "/admin/products", label: "📦 商品管理", icon: "📦" },
  { href: "/admin/orders", label: "📋 订单管理", icon: "📋" },
  { href: "/admin/categories", label: "📂 分类管理", icon: "📂" },
  { href: "/admin/coupons", label: "🎫 优惠券管理", icon: "🎫" },
  { href: "/admin/banners", label: "🖼️ 轮播管理", icon: "🖼️" },
  { href: "/admin/users", label: "👥 用户管理", icon: "👥" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 border-r border-gray-200 bg-gray-900 text-white">
      <div className="flex h-16 items-center border-b border-gray-700 px-6">
        <Link href="/admin" className="text-lg font-bold">
          🛍️ Mini Mall Admin
        </Link>
      </div>
      <nav className="mt-4 space-y-1 px-3">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      {/* Bottom: back to store */}
      <div className="absolute bottom-4 left-0 w-full px-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          ← 返回商城
        </Link>
      </div>
    </aside>
  );
}
