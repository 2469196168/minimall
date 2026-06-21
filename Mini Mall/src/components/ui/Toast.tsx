"use client";

import type { Toast as ToastType } from "@/hooks/useToast";

// ======== 图标映射 ========
const iconMap: Record<ToastType["type"], string> = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
  warning: "⚠️",
};

const colorMap: Record<ToastType["type"], string> = {
  success: "border-green-300 bg-green-50 text-green-800",
  error: "border-red-300 bg-red-50 text-red-800",
  info: "border-blue-300 bg-blue-50 text-blue-800",
  warning: "border-yellow-300 bg-yellow-50 text-yellow-800",
};

interface ToastContainerProps {
  toasts: ToastType[];
  removeToast: (id: string) => void;
}

export default function ToastContainer({
  toasts,
  removeToast,
}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-sm:left-4 max-sm:right-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all animate-[slideInRight_0.3s_ease-out] ${colorMap[toast.type]}`}
        >
          <span className="shrink-0 text-base">{iconMap[toast.type]}</span>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
            aria-label="关闭"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
      ))}
    </div>
  );
}
