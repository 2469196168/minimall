"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { formatPrice, safeParseImages } from "@/lib/utils";

export default function CartPage() {
  const { items, loading, totalCount, totalAmount, updateQuantity, removeItem } = useCart();
  const router = useRouter();

  // 加载中骨架
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">购物车</h1>
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex animate-pulse gap-4 rounded-xl border border-gray-200 p-4">
              <div className="h-20 w-20 rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="h-3 w-16 rounded bg-gray-200" />
                <div className="h-6 w-24 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 空购物车
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-6xl">🛒</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">购物车是空的</h1>
        <p className="mt-2 text-sm text-gray-500">快去挑选心仪的商品吧</p>
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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">
        购物车 ({totalCount} 件)
      </h1>

      {/* 商品列表 */}
      <div className="mt-6 space-y-4">
        {items.map((item) => {
          const images = safeParseImages(item.product.images);
          const image = images[0] || "https://picsum.photos/200/200";
          const subtotal = item.product.price * item.quantity;
          const isMaxStock = item.quantity >= item.product.inventory;

          return (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
            >
              {/* 商品图片 */}
              <Link href={`/products/${item.product.slug}`} className="shrink-0">
                <img
                  src={image}
                  alt={item.product.name}
                  className="h-20 w-20 rounded-lg object-cover"
                />
              </Link>

              {/* 商品信息 + 数量控制 */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {item.product.name}
                  </Link>
                  <p className="mt-0.5 text-lg font-bold text-red-600">
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  {/* 数量调节 */}
                  <div className="flex items-center gap-0 rounded-lg border border-gray-300">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-3 py-1 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-medium text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={isMaxStock}
                      className="px-3 py-1 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      title={isMaxStock ? `库存仅 ${item.product.inventory} 件` : undefined}
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部汇总 */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>商品合计</span>
          <span>{formatPrice(totalAmount)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
          <span>运费</span>
          <span className="text-green-600">免运费</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-lg font-bold text-gray-900">应付总额</span>
          <span className="text-xl font-bold text-red-600">
            {formatPrice(totalAmount)}
          </span>
        </div>
        <button
          onClick={() => router.push("/checkout")}
          className="mt-4 w-full rounded-lg bg-indigo-600 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          去结算
        </button>
      </div>

      <div className="mt-6">
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
