"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/profile");
      return;
    }
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user, loading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "保存成功" });
        refresh();
      } else {
        setMessage({ type: "error", text: data.error || "保存失败" });
      }
    } catch {
      setMessage({ type: "error", text: "网络错误，请稍后再试" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 rounded bg-gray-200" />
          <div className="h-64 rounded-lg bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-8 text-xl font-bold text-gray-900">个人中心</h1>

      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-2 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 账户信息卡片 */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400">
              {user.role === "ADMIN" ? "管理员" : "普通用户"} ·{" "}
              注册于 {new Date(user.createdAt).toLocaleDateString("zh-CN")}
            </p>
          </div>
        </div>
      </div>

      {/* 编辑表单 */}
      <form onSubmit={handleSave} className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">编辑资料</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              昵称
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={20}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              手机号
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="选填"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "保存中..." : "保存修改"}
          </button>
        </div>
      </form>

      {/* 修改密码 */}
      <div className="mt-4 rounded-xl bg-white p-6 shadow-sm">
        <Link
          href="/profile/change-password"
          className="flex items-center justify-between text-sm"
        >
          <span className="font-medium text-gray-900">修改密码</span>
          <span className="text-gray-400">→</span>
        </Link>
      </div>

      {/* 快捷入口 */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">快捷入口</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/orders" className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700 hover:border-indigo-300 hover:bg-indigo-50">
            📦 我的订单
          </Link>
          <Link href="/wishlist" className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700 hover:border-indigo-300 hover:bg-indigo-50">
            ♥ 我的收藏
          </Link>
          <Link href="/profile/addresses" className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700 hover:border-indigo-300 hover:bg-indigo-50">
            📍 收货地址
          </Link>
          {user.role === "ADMIN" && (
            <Link href="/admin" className="rounded-lg border border-indigo-200 p-3 text-sm text-indigo-700 hover:bg-indigo-50">
              ⚙️ 管理后台
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
