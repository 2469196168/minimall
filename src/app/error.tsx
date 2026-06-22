"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Root Error:", error);
  }, [error]);

  return (
    <html lang="zh-CN" className="h-full">
      <body className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="px-4 py-16 text-center">
          <p className="text-6xl">😵</p>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            页面出错了
          </h1>
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
            <a
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              返回首页
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
