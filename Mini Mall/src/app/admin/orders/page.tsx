"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_MAP, type OrderStatus } from "@/types";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { id: string; name: string; images: string };
}

interface Order {
  id: string;
  orderNo: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  user: { id: string; name: string; email: string };
  items: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-orange-600 bg-orange-50",
  PAID: "text-blue-600 bg-blue-50",
  SHIPPED: "text-purple-600 bg-purple-50",
  DELIVERED: "text-green-600 bg-green-50",
  CANCELLED: "text-gray-500 bg-gray-100",
};

const STATUS_TABS = [
  { value: "", label: "全部" },
  { value: "PENDING", label: "待付款" },
  { value: "PAID", label: "已付款" },
  { value: "SHIPPED", label: "已发货" },
  { value: "DELIVERED", label: "已完成" },
  { value: "CANCELLED", label: "已取消" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("pageSize", "20");

    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setOrders(d.data.items);
          setTotalPages(d.data.totalPages);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>

      {/* 状态筛选 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 订单表格 */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400 animate-pulse">
            加载中...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">暂无订单</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                <th className="px-4 py-3">订单号</th>
                <th className="px-4 py-3">用户</th>
                <th className="px-4 py-3">金额</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">时间</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {order.orderNo}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{order.user.name}</p>
                    <p className="text-xs text-gray-400">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[order.status] || "text-gray-500 bg-gray-100"
                      }`}
                    >
                      {ORDER_STATUS_MAP[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                    >
                      查看详情
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>共 {totalPages} 页</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
