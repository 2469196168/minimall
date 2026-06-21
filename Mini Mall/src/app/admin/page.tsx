"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_MAP, type OrderStatus } from "@/types";

interface Stats {
  counts: {
    products: number;
    orders: number;
    users: number;
    pending: number;
    paid: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  recentOrders: {
    id: string;
    orderNo: string;
    total: number;
    status: OrderStatus;
    createdAt: string;
    user: { name: string };
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-orange-600 bg-orange-50",
  PAID: "text-blue-600 bg-blue-50",
  SHIPPED: "text-purple-600 bg-purple-50",
  DELIVERED: "text-green-600 bg-green-50",
  CANCELLED: "text-gray-500 bg-gray-100",
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <div className="mt-8 animate-pulse text-sm text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>

      {/* 统计卡片 */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">商品总数</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {stats?.counts.products ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">订单总数</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {stats?.counts.orders ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">用户总数</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {stats?.counts.users ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">待处理订单</p>
          <p className="mt-1 text-3xl font-bold text-orange-600">
            {stats?.counts.pending ?? 0}
          </p>
        </div>
      </div>

      {/* 订单状态分布 */}
      {stats && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">订单状态分布</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            {[
              { label: "待付款", count: stats.counts.pending, color: "bg-orange-500" },
              { label: "已付款", count: stats.counts.paid, color: "bg-blue-500" },
              { label: "已发货", count: stats.counts.shipped, color: "bg-purple-500" },
              { label: "已完成", count: stats.counts.delivered, color: "bg-green-500" },
              { label: "已取消", count: stats.counts.cancelled, color: "bg-gray-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="text-gray-600">{item.label}</span>
                <span className="font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 最近订单 */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">最近订单</h3>
          <Link href="/admin/orders" className="text-xs text-indigo-600 hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto">
          {stats?.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400">暂无订单</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-2">订单号</th>
                  <th className="py-2">用户</th>
                  <th className="py-2">金额</th>
                  <th className="py-2">状态</th>
                  <th className="py-2">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats?.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-2 font-mono text-xs text-gray-600">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="hover:text-indigo-600"
                      >
                        {order.orderNo}
                      </Link>
                    </td>
                    <td className="py-2 text-gray-900">{order.user.name}</td>
                    <td className="py-2 font-medium">{formatPrice(order.total)}</td>
                    <td className="py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[order.status] || "text-gray-500 bg-gray-100"
                        }`}
                      >
                        {ORDER_STATUS_MAP[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-2 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { href: "/admin/products", label: "📦 商品" },
          { href: "/admin/orders", label: "📋 订单" },
          { href: "/admin/reviews", label: "⭐ 评价" },
          { href: "/admin/categories", label: "📂 分类" },
          { href: "/admin/coupons", label: "🎫 优惠券" },
          { href: "/admin/banners", label: "🖼️ 轮播" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
