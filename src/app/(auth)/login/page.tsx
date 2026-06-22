"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email.trim(), password);
    if (!result.success) {
      setError(result.error || "登录失败");
      setLoading(false);
      return;
    }

    // 登录成功，刷新页面以更新服务端状态
    router.push("/");
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-center text-xl font-bold text-gray-900">
        登录
      </h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            邮箱
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="请输入邮箱"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            密码
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="请输入密码"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        还没有账号？{" "}
        <Link href="/register" className="text-indigo-600 hover:underline">
          立即注册
        </Link>
      </p>

      {/* 种子账号提示 — 仅开发环境 */}
      {process.env.NODE_ENV !== "production" && (
        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          <p className="font-medium">测试账号：</p>
          <p>管理员：admin@minimall.com / admin123</p>
          <p>用户：user@minimall.com / user123</p>
        </div>
      )}
    </div>
  );
}
