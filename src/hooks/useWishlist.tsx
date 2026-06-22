"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./useAuth";

// ======== Types ========
interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  images: string;
  salesCount: number;
  isActive: boolean;
  reviews: { rating: number }[];
}

interface WishlistItem {
  id: string;
  productId: string;
  product: WishlistProduct;
}

interface WishlistContextValue {
  items: WishlistItem[];
  loading: boolean;
  /** 检查某商品是否已收藏 */
  isWished: (productId: string) => boolean;
  /** toggle 收藏/取消收藏 */
  toggle: (productId: string) => Promise<{ wished: boolean }>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 用户登录状态变化时刷新收藏列表
  useEffect(() => {
    if (user) {
      refresh();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user, refresh]);

  const isWished = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  const toggle = useCallback(async (productId: string) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.data.wished) {
          // 已收藏 → 添加到本地列表
          await refresh();
        } else {
          // 取消收藏 → 从本地列表移除
          setItems((prev) => prev.filter((i) => i.productId !== productId));
        }
        return { wished: data.data.wished };
      }
      return { wished: isWished(productId) };
    } catch {
      return { wished: isWished(productId) };
    }
  }, [refresh, isWished]);

  return (
    <WishlistContext.Provider value={{ items, loading, isWished, toggle, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within <WishlistProvider>");
  }
  return ctx;
}
