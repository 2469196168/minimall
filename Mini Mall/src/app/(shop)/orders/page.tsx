"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice, safeParseImages } from "@/lib/utils";
import { ORDER_STATUS_MAP, type OrderStatus } from "@/types";

// ======== Types ========
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string;
  };
}

interface Order {
  id: string;
  orderNo: string;
  status: OrderStatus;
  total: number;
  discount: number;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_TABS: { key: string; label: string }[] = [
  { key: "", label: "全部" },
  { key: "PENDING", label: "待付款" },
  { key: "PAID", label: "已付款" },
  { key: "SHIPPED", label: "已发货" },
  { key: "DELIVERED", label: "已完成" },
  { key: "CANCELLED", label: "已取消" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-orange-600 bg-orange-50",
  PAID: "text-blue-600 bg-blue-50",
  SHIPPED: "text-purple-600 bg-purple-50",
  DELIVERED: "text-green-600 bg-green-50",
  CANCELLED: "text-gray-500 bg-gray-100",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const url = statusFilter
      ? `/api/orders?status=${statusFilter}`
      : "/api/orders";
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrders(d.data);
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">我的订单</h1>

      {/* 状态筛选标签 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === tab.key
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 订单列表 */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-gray-200 p-4">
                <div className="h-4 w-48 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-32 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-6xl">📋</p>
            <h2 className="mt-4 text-xl font-bold text-gray-900">暂无订单</h2>
            <p className="mt-2 text-sm text-gray-500">
              {statusFilter ? "该状态下暂无订单" : "快去下单吧"}
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white"
            >
              去逛逛
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">订单号</p>
                  <p className="text-sm font-mono text-gray-700">{order.orderNo}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_COLORS[order.status] || "text-gray-500 bg-gray-100"
                  }`}
                >
                  {ORDER_STATUS_MAP[order.status] || order.status}
                </span>
              </div>

              {/* 商品缩略图 */}
              <div className="mt-3 flex items-center gap-2">
                {order.items.slice(0, 4).map((item) => {
                  const images = safeParseImages(item.product.images);
                  return (
                    <img
                      key={item.id}
                      src={images[0] || "https://picsum.photos/80/80"}
                      alt={item.product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  );
                })}
                {order.items.length > 4 && (
                  <span className="text-xs text-gray-400">+{order.items.length - 4}</span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <div className="text-right">
                  {order.discount > 0 && (
                    <span className="mr-2 text-xs text-green-600">
                      已优惠{formatPrice(order.discount)}
                    </span>
                  )}
                  <span className="text-lg font-bold text-red-600">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
