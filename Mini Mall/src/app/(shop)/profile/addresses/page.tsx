"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

interface AddressForm {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

const EMPTY_FORM: AddressForm = {
  name: "",
  phone: "",
  province: "",
  city: "",
  district: "",
  detail: "",
  isDefault: false,
};

export default function AddressesPage() {
  const { user, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAddresses = () => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAddresses(d.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) fetchAddresses();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading]);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setEditId(addr.id);
    setForm({
      name: addr.name,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      detail: addr.detail,
      isDefault: addr.isDefault,
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 简单校验
    if (!form.name || !form.phone || !form.detail) {
      setError("请填写完整信息");
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      setError("手机号格式不正确");
      return;
    }

    setSaving(true);
    try {
      const url = editId ? `/api/addresses/${editId}` : "/api/addresses";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          province: form.province || "省",
          city: form.city || "市",
          district: form.district || "区",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        fetchAddresses();
      } else {
        setError(data.error || "保存失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此地址吗？")) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchAddresses();
    } catch {
      // ignore
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) fetchAddresses();
    } catch {
      // ignore
    }
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 rounded bg-gray-200" />
          <div className="h-40 rounded-lg bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">收货地址</h1>
        <button
          onClick={openAdd}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + 新增地址
        </button>
      </div>

      {/* 地址列表 */}
      <div className="mt-6 space-y-3">
        {addresses.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            暂无收货地址，点击右上角新增
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{addr.name}</span>
                    <span className="text-gray-500">{addr.phone}</span>
                    {addr.isDefault && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600">
                        默认
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-gray-500">
                    {addr.province} {addr.city} {addr.district} {addr.detail}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                <button
                  onClick={() => openEdit(addr)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  编辑
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-gray-500 hover:text-indigo-600"
                  >
                    设为默认
                  </button>
                )}
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 新增/编辑弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">
              {editId ? "编辑地址" : "新增地址"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600">收货人</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="姓名"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600">手机号</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="13800138000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">详细地址</label>
                <input
                  type="text"
                  value={form.detail}
                  onChange={(e) => setForm({ ...form, detail: e.target.value })}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="街道、门牌号等"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="accent-indigo-600"
                />
                设为默认地址
              </label>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? "保存中..." : "保存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
