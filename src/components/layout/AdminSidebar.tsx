"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/admin", label: "📊 仪表盘", icon: "📊" },
  { href: "/admin/products", label: "📦 商品管理", icon: "📦" },
  { href: "/admin/orders", label: "📋 订单管理", icon: "📋" },
  { href: "/admin/reviews", label: "⭐ 评价管理", icon: "⭐" },
  { href: "/admin/categories", label: "📂 分类管理", icon: "📂" },
  { href: "/admin/coupons", label: "🎫 优惠券管理", icon: "🎫" },
  { href: "/admin/banners", label: "🖼️ 轮播管理", icon: "🖼️" },
  { href: "/admin/users", label: "👥 用户管理", icon: "👥" },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-700 px-6">
        <Link href="/admin" className="text-lg font-bold" onClick={onClose}>
          🛍️ Mini Mall Admin
        </Link>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
            aria-label="关闭侧边栏"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
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
      <div className="border-t border-gray-700 px-3 py-4">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          ← 返回商城
        </Link>
      </div>
    </div>
  );
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-60 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar — overlay drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
          {/* Drawer */}
          <aside className="fixed left-0 top-0 z-50 h-full w-60 animate-[slideInLeft_0.3s_ease-out] lg:hidden">
            <SidebarContent onClose={onClose} />
          </aside>
        </>
      )}
    </>
  );
}
