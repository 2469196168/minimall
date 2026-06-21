"use client";

import Link from "next/link";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { formatPrice, safeParseImages, computeAvgRating } from "@/lib/utils";
import StarRating from "@/components/ui/StarRating";

export default function WishlistPage() {
  const { items, loading, toggle } = useWishlist();
  const { addItem } = useCart();

  // 加载中骨架
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">我的收藏</h1>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 p-4">
              <div className="aspect-square rounded-lg bg-gray-200" />
              <div className="mt-3 h-4 w-24 rounded bg-gray-200" />
              <div className="mt-1 h-5 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 空收藏
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-6xl">♡</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">收藏夹是空的</h1>
        <p className="mt-2 text-sm text-gray-500">收藏喜欢的商品，方便以后购买</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          去逛逛
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">
        我的收藏 ({items.length})
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const images = safeParseImages(item.product.images);
          const image = images[0] || "https://picsum.photos/400/400";
          const avgRating = item.product.reviews
            ? computeAvgRating(item.product.reviews)
            : 0;

          return (
            <div
              key={item.id}
              className="group relative rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
            >
              {/* 取消收藏按钮 */}
              <button
                onClick={() => toggle(item.productId)}
                className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-red-500 shadow-sm transition-transform hover:scale-110"
                title="取消收藏"
              >
                ♥
              </button>

              {/* 商品图片 */}
              <Link href={`/products/${item.product.slug}`}>
                <div className="aspect-square overflow-hidden rounded-t-xl bg-gray-100">
                  <img
                    src={image}
                    alt={item.product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              </Link>

              {/* 商品信息 */}
              <div className="p-3">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="truncate text-sm font-medium text-gray-900 hover:text-indigo-600"
                >
                  {item.product.name}
                </Link>

                {/* 评分 */}
                <div className="mt-1">
                  <StarRating rating={avgRating} />
                </div>

                {/* 价格 */}
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-red-600">
                    {formatPrice(item.product.price)}
                  </span>
                  {item.product.compareAtPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(item.product.compareAtPrice)}
                    </span>
                  )}
                </div>

                {/* 销量 */}
                <p className="mt-1 text-xs text-gray-500">
                  已售 {item.product.salesCount}
                </p>

                {/* 加购按钮 */}
                <button
                  onClick={() => addItem(item.productId, 1)}
                  className="mt-3 w-full rounded-lg border border-indigo-600 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
                >
                  加入购物车
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <Link
          href="/products"
          className="text-sm text-gray-500 hover:text-indigo-600"
        >
          ← 继续购物
        </Link>
      </div>
    </div>
  );
}
