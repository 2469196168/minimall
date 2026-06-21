"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ProductCardData } from "@/types";
import StarRating from "@/components/ui/StarRating";
import { safeParseImages } from "@/lib/utils";

/**
 * 商品卡片 — 丰富风格
 * 展示：图片 + 名称 + 评分 + 价格（划线价）+ 销量 + 收藏按钮（占位）
 */
export default function ProductCard({ product }: { product: ProductCardData }) {
  const mainImage = useMemo(() => {
    const images = safeParseImages(product.images);
    return images[0] || "https://picsum.photos/400/400";
  }, [product.images]);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
    >
      {/* 收藏按钮占位 — Phase 4 实现交互 */}
      <button
        onClick={(e) => {
          e.preventDefault();
          // Phase 4 实现收藏逻辑
        }}
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-gray-400 shadow-sm hover:text-red-500"
        title="收藏"
      >
        ♡
      </button>

      {/* 商品图片 */}
      <div className="aspect-square overflow-hidden rounded-t-xl bg-gray-100">
        <img
          src={mainImage}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>

      {/* 商品信息 */}
      <div className="p-3">
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
      </div>
    </Link>
  );
}
