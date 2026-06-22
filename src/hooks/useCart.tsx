"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "./useAuth";

// ======== Types ========
interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string;
  inventory: number;
  isActive: boolean;
}

interface CartItem {
  id: string;
  quantity: number;
  productId: string;
  product: CartProduct;
}

interface CartContextValue {
  items: CartItem[];
  loading: boolean;
  totalCount: number;
  totalAmount: number;
  addItem: (productId: string, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (productId: string, quantity: number) => Promise<{ success: boolean; error?: string }>;
  removeItem: (productId: string) => Promise<{ success: boolean; error?: string }>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
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

  // 用户登录状态变化时刷新购物车
  useEffect(() => {
    if (user) {
      refresh();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user, refresh]);

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (data.success) {
        // 更新本地状态：合并或新增
        setItems((prev) => {
          const idx = prev.findIndex((i) => i.productId === productId);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = data.data;
            return updated;
          }
          return [data.data, ...prev];
        });
        return { success: true };
      }
      return { success: false, error: data.error || "添加失败" };
    } catch {
      return { success: false, error: "网络错误，请稍后再试" };
    }
  }, []);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (data.success) {
        if (quantity === 0) {
          // 删除
          setItems((prev) => prev.filter((i) => i.productId !== productId));
        } else {
          // 更新数量
          setItems((prev) =>
            prev.map((i) => (i.productId === productId ? data.data : i))
          );
        }
        return { success: true };
      }
      return { success: false, error: data.error || "更新失败" };
    } catch {
      return { success: false, error: "网络错误，请稍后再试" };
    }
  }, []);

  const removeItem = useCallback(async (productId: string) => {
    try {
      const res = await fetch(`/api/cart?productId=${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
        return { success: true };
      }
      return { success: false, error: data.error || "移除失败" };
    } catch {
      return { success: false, error: "网络错误，请稍后再试" };
    }
  }, []);

  // 派生计算
  const totalCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, loading, totalCount, totalAmount, addItem, updateQuantity, removeItem, refresh }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within <CartProvider>");
  }
  return ctx;
}
