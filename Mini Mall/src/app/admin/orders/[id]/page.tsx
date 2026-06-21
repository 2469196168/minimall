"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { formatPrice, safeParseImages } from "@/lib/utils";
import { ORDER_STATUS_MAP, type OrderStatus } from "@/types";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { id: string; name: string; slug: string; images: string };
}

interface Order {
  id: string;
  orderNo: string;
  status: OrderStatus;
  total: number;
  discount: number;
  note: string | null;
  addressSnapshot: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string };
  items: OrderItem[];
  coupon: { id: string; code: string; name: string; type: string; value: number } | null;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-orange-600 bg-orange-50",
  PAID: "text-blue-600 bg-blue-50",
  SHIPPED: "text-purple-600 bg-purple-50",
  DELIVERED: "text-green-600 bg-green-50",
  CANCELLED: "text-gray-500 bg-gray-100",
};

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const fetchOrder = () => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrder(d.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleShip = async () => {
    if (!order) return;
    setActionLoading("SHIPPED");
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SHIPPED" }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        alert(data.error || "操作失败");
      }
    } catch {
      alert("网络错误");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-6xl">❓</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">订单不存在</h1>
        <Link href="/admin/orders" className="mt-4 inline-block text-indigo-600 hover:underline">
          返回订单列表
        </Link>
      </div>
    );
  }

  const address = order.addressSnapshot
    ? (() => { try { return JSON.parse(order.addressSnapshot); } catch { return null; } })()
    : null;
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">订单详情</h1>
          <p className="mt-1 text-xs text-gray-400 font-mono">{order.orderNo}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            STATUS_COLORS[order.status] || "text-gray-500 bg-gray-100"
          }`}
        >
          {ORDER_STATUS_MAP[order.status] || order.status}
        </span>
      </div>

      {/* 用户信息 */}
      <section className="mt-4 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700">下单用户</h3>
        <p className="mt-1 text-sm text-gray-600">
          {order.user.name} ({order.user.email})
        </p>
      </section>

      {/* 收货地址 */}
      {address && (
        <section className="mt-4 rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700">收货信息</h3>
          <div className="mt-1 text-sm text-gray-600">
            <p>{address.name} — {address.phone}</p>
            <p>{address.province} {address.city} {address.district} {address.detail}</p>
          </div>
        </section>
      )}

      {/* 商品列表 */}
      <section className="mt-4">
        <h3 className="text-sm font-semibold text-gray-700">商品明细</h3>
        <div className="mt-2 divide-y rounded-lg border border-gray-200">
          {order.items.map((item) => {
            const images = safeParseImages(item.product.images);
            return (
              <div key={item.id} className="flex items-center gap-3 p-3">
                <img
                  src={images[0] || "https://picsum.photos/100/100"}
                  alt={item.product.name}
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {item.product.name}
                  </p>
                  <div className="text-xs text-gray-500">
                    {formatPrice(item.price)} x {item.quantity}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 金额汇总 */}
      <section className="mt-4 rounded-lg border border-gray-200 p-4">
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>商品合计</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>运费</span>
            <span className="text-green-600">免运费</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>
                优惠券抵扣
                {order.coupon && <span className="ml-1 text-xs">({order.coupon.name})</span>}
              </span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex justify-between border-t border-gray-100 pt-3">
          <span className="font-bold text-gray-900">实付金额</span>
          <span className="text-xl font-bold text-red-600">{formatPrice(order.total)}</span>
        </div>
      </section>

      {/* 时间 */}
      <section className="mt-4 space-y-1 text-xs text-gray-500">
        <p>创建时间：{new Date(order.createdAt).toLocaleString("zh-CN")}</p>
        <p>更新时间：{new Date(order.updatedAt).toLocaleString("zh-CN")}</p>
      </section>

      {/* 操作按钮 */}
      <div className="mt-6">
        {order.status === "PAID" && (
          <button
            onClick={handleShip}
            disabled={actionLoading === "SHIPPED"}
            className="w-full rounded-lg bg-purple-600 py-3 text-center text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLoading === "SHIPPED" ? "处理中..." : "🚚 确认发货"}
          </button>
        )}
      </div>

      <div className="mt-6">
        <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-indigo-600">
          ← 返回订单列表
        </Link>
      </div>
    </div>
  );
}
