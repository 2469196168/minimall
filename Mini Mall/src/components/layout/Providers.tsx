"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import { ToastProvider } from "@/hooks/useToast";
import ToastContainer from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import type { ReactNode } from "react";

/**
 * Toast 渲染组件
 * 在 ToastProvider 内部消费 context
 */
function ToastRenderer() {
  const { toasts, removeToast } = useToast();
  return <ToastContainer toasts={toasts} removeToast={removeToast} />;
}

/**
 * 客户端 Provider 包装器
 * 在根布局中引入所有 Client Context
 * 嵌套顺序：Toast → Auth → Cart → Wishlist
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </AuthProvider>
      <ToastRenderer />
    </ToastProvider>
  );
}
