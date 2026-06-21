"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ProductCardData } from "@/types";
import StarRating from "@/components/ui/StarRating";
import { safeParseImages } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

/**
 * 商品卡片 — 丰富风格
 * 展示：图片 + 名称 + 评分 + 价格（划线价）+ 销量 + 收藏按钮 + 加购按钮
 */
export default function ProductCard({ product }: { product: ProductCardData }) {
  const mainImage = useMemo(() => {
    const images = safeParseImages(product.images);
    return images[0] || "https://picsum.photos/400/400";
  }, [product.images]);

  const { isWished, toggle } = useWishlist();
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const wished = isWished(product.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    toggle(product.id);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    setAdding(true);
    await addItem(product.id, 1);
    setAdding(false);
  };

  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
      {/* 收藏按钮 */}
      <button
        onClick={handleWishlist}
        className={`absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-colors ${
          wished
            ? "bg-white/90 text-red-500"
            : "bg-white/80 text-gray-400 hover:text-red-500"
        }`}
        title={wished ? "取消收藏" : "收藏"}
      >
        {wished ? "♥" : "♡"}
      </button>

      {/* 商品图片 */}
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square overflow-hidden rounded-t-xl bg-gray-100">
          <img
            src={mainImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      </Link>

      {/* 商品信息 */}
      <Link href={`/products/${product.slug}`} className="block p-3">
        <h3 className="truncate text-sm font-medium text-gray-900">
          {product.name}
        </h3>

        {/* 评分 */}
        <div className="mt-1">
          <StarRating rating={product.avgRating} count={product.reviewCount} showCount />
        </div>

        {/* 价格 */}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold text-red-600">
            ¥{product.price.toFixed(2)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-gray-400 line-through">
              ¥{product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* 销量 */}
        <p className="mt-1 text-xs text-gray-500">
          已售 {product.salesCount}
        </p>
      </Link>

      {/* 加购按钮 */}
      <div className="px-3 pb-3">
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className="w-full rounded-lg bg-indigo-600 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {adding ? "添加中..." : "加入购物车"}
        </button>
      </div>
    </div>
  );
}
