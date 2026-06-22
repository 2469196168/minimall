"use client";

import { useState, useEffect } from "react";

interface Coupon {
  id: string;
  code: string;
  name: string;
  type: string;
  value: number;
  minOrderAmount: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  _count: { orders: number };
}

interface CouponForm {
  code: string;
  name: string;
  type: string;
  value: number;
  minOrderAmount: number;
  usageLimit: number;
  validUntil: string;
}

const EMPTY_FORM: CouponForm = {
  code: "",
  name: "",
  type: "FIXED",
  value: 0,
  minOrderAmount: 0,
  usageLimit: 0,
  validUntil: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCoupons = () => {
    setLoading(true);
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCoupons(d.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setEditId(c.id);
    setForm({
      code: c.code,
      name: c.name,
      type: c.type,
      value: c.value,
      minOrderAmount: c.minOrderAmount,
      usageLimit: c.usageLimit,
      validUntil: new Date(c.validUntil).toISOString().slice(0, 16),
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.code || !form.name || form.value <= 0 || !form.validUntil) {
      setError("请填写完整信息");
      return;
    }

    setSaving(true);
    try {
      const url = editId ? `/api/admin/coupons/${editId}` : "/api/admin/coupons";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          name: form.name,
          type: form.type,
          value: form.value,
          minOrderAmount: form.minOrderAmount,
          usageLimit: form.usageLimit,
          validUntil: form.validUntil,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        fetchCoupons();
      } else {
        setError(data.error || "保存失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchCoupons();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此优惠券吗？")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchCoupons();
      else alert(data.error || "删除失败");
    } catch { alert("网络错误"); }
    finally { setDeletingId(null); }
  };

  const formatType = (t: string, v: number) =>
    t === "FIXED" ? `¥${v}` : t === "PERCENT" ? `${(v * 100).toFixed(0)}%` : v;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">优惠券管理</h1>
        <button onClick={openAdd} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">+ 新增优惠券</button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400 animate-pulse">加载中...</div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">暂无优惠券</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                <th className="px-3 py-3">名称</th>
                <th className="px-3 py-3">券码</th>
                <th className="px-3 py-3">类型/优惠</th>
                <th className="px-3 py-3">门槛</th>
                <th className="px-3 py-3">使用/上限</th>
                <th className="px-3 py-3">状态</th>
                <th className="px-3 py-3">有效期</th>
                <th className="px-3 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-3 py-3 font-mono text-xs">{c.code}</td>
                  <td className="px-3 py-3">{formatType(c.type, c.value)}</td>
                  <td className="px-3 py-3 text-gray-500">
                    {c.minOrderAmount > 0 ? `满¥${c.minOrderAmount}` : "无门槛"}
                  </td>
                  <td className="px-3 py-3 text-gray-500">
                    {c.usedCount}{c.usageLimit > 0 ? ` / ${c.usageLimit}` : " / ∞"}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handleToggleActive(c.id, c.isActive)}
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        c.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {c.isActive ? "启用" : "停用"}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">
                    {new Date(c.validUntil).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => openEdit(c)} className="text-indigo-600 hover:text-indigo-800">编辑</button>
                      <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} className="text-red-500 hover:text-red-700 disabled:opacity-50">{deletingId === c.id ? "..." : "删除"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-8">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">{editId ? "编辑优惠券" : "新增优惠券"}</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600">优惠券名称 *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">券码 *</label>
                  <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600">优惠类型 *</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                    <option value="FIXED">固定金额</option>
                    <option value="PERCENT">百分比折扣</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">
                    优惠值 * ({form.type === "FIXED" ? "元" : "小数，如 0.1=10%"})
                  </label>
                  <input type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600">最低金额 / 门槛</label>
                  <input type="number" step="0.01" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: parseFloat(e.target.value) || 0 })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">使用上限 (0=无限)</label>
                  <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: parseInt(e.target.value) || 0 })} min={0} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">有效期至 *</label>
                <input type="datetime-local" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50">取消</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">{saving ? "保存中..." : "保存"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
