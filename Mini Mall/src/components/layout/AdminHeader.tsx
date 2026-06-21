"use client";

import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  user?: { name: string; email: string } | null;
  onToggleSidebar?: () => void;
}

export function AdminHeader({ user, onToggleSidebar }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:ml-60 lg:px-8">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            aria-label="打开侧边栏"
          >
            <svg
              className="h-5 w-5"
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
        )}
        <h1 className="text-lg font-semibold text-gray-800">管理后台</h1>
      </div>
      <div className="flex items-center gap-4 text-sm">
        {user && (
          <>
            <span className="hidden text-gray-600 sm:inline">{user.name}</span>
            <span className="hidden text-gray-400 sm:inline">
              ({user.email})
            </span>
          </>
        )}
        <button
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          退出
        </button>
      </div>
    </header>
  );
}
