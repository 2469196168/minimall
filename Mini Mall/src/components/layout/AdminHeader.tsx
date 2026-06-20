"use client";

import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  user?: { name: string; email: string } | null;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 ml-60 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
      <h1 className="text-lg font-semibold text-gray-800">管理后台</h1>
      <div className="flex items-center gap-4 text-sm">
        {user && (
          <>
            <span className="text-gray-600">{user.name}</span>
            <span className="text-gray-400">({user.email})</span>
          </>
        )}
        <button
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-600 hover:bg-gray-50"
        >
          退出登录
        </button>
      </div>
    </header>
  );
}
