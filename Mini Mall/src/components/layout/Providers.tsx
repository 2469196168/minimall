"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import type { ReactNode } from "react";

/**
 * 客户端 Provider 包装器
 * 在根布局中引入所有 Client Context
 * 嵌套顺序：Auth → Cart → Wishlist
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
