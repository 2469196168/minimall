"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Admin Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-5xl">😵</p>
      <h2 className="mt-4 text-xl font-bold text-gray-900">后台出错了</h2>
      <p className="mt-2 text-sm text-gray-500">
        {process.env.NODE_ENV === "development"
          ? error.message
          : "发生了未知错误，请稍后再试"}
      </p>
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          重试
        </button>
        <Link
          href="/admin"
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          返回后台首页
        </Link>
      </div>
    </div>
  );
}
