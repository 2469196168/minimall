"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  inventory: number;
}

/**
 * 商品详情页加购按钮
 * 点击添加到购物车，含成功反馈
 */
export default function AddToCartButton({ productId, inventory }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const isOutOfStock = inventory <= 0;

  const handleAdd = async () => {
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    setAdding(true);
    const result = await addItem(productId, quantity);
    setAdding(false);
    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 数量选择 */}
      {!isOutOfStock && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">数量</span>
          <div className="flex items-center rounded-lg border border-gray-300">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-[2.5rem] text-center text-sm font-medium">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(inventory, q + 1))}
              disabled={quantity >= inventory}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>
          <span className="text-xs text-gray-400">库存 {inventory} 件</span>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          disabled={isOutOfStock || adding}
          className={`flex-1 rounded-lg px-6 py-3 text-center font-medium text-white transition-colors ${
            added
              ? "bg-green-600"
              : isOutOfStock
                ? "cursor-not-allowed bg-gray-400"
                : "bg-indigo-600 hover:bg-indigo-700"
          } disabled:cursor-not-allowed`}
        >
          {isOutOfStock
            ? "暂时缺货"
            : added
              ? "✓ 已添加到购物车"
              : adding
                ? "添加中..."
                : "加入购物车"}
        </button>
        <button
          disabled={isOutOfStock}
          className="flex-1 rounded-lg bg-red-600 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          立即购买
        </button>
      </div>
    </div>
  );
}
