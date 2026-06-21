"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  inventory: number;
  isActive: boolean;
  isFeatured: boolean;
  images: string;
  category: { name: string } | null;
  categoryId?: string;
  description?: string;
  _count: { reviews: number; orderItems: number };
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  compareAtPrice: string;
  images: string;
  categoryId: string;
  inventory: number;
  isActive: boolean;
  isFeatured: boolean;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  price: 0,
  compareAtPrice: "",
  images: "",
  categoryId: "",
  inventory: 0,
  isActive: true,
  isFeatured: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "12" });
    if (search) params.set("search", search);

    fetch(`/api/admin/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProducts(d.data.items);
          setTotalPages(d.data.totalPages);
        }
      })
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.data);
      });
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, search]);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const openEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`);
      const d = await res.json();
      if (d.success) {
        const p = d.data;
        setEditId(id);
        setForm({
          name: p.name,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
          images: p.images,
          categoryId: p.categoryId || "",
          inventory: p.inventory,
          isActive: p.isActive,
          isFeatured: p.isFeatured,
        });
        setError("");
        setShowForm(true);
      }
    } catch {
      alert("获取商品信息失败");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.description || form.price <= 0) {
      setError("请填写商品名称、描述和价格");
      return;
    }

    // 处理图片：一行一个 URL 转为 JSON 字符串
    let imagesJson = "[]";
    if (form.images.trim()) {
      const urls = form.images
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      imagesJson = JSON.stringify(urls);
    }

    setSaving(true);
    try {
      const url = editId
        ? `/api/admin/products/${editId}`
        : "/api/admin/products";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: form.price,
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
          images: imagesJson,
          categoryId: form.categoryId || undefined,
          inventory: form.inventory,
          isActive: form.isActive,
          isFeatured: form.isFeatured,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        fetchProducts();
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
    if (!confirm("确定删除此商品吗？此操作不可恢复。")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      } else {
        alert(data.error || "删除失败");
      }
    } catch {
      alert("网络错误");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        <button
          onClick={openAdd}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + 新增商品
        </button>
      </div>

      {/* 搜索 */}
      <div className="mt-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="搜索商品名称..."
          className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* 表格 */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400 animate-pulse">加载中...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">暂无商品</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                <th className="px-3 py-3">商品</th>
                <th className="px-3 py-3">分类</th>
                <th className="px-3 py-3">价格</th>
                <th className="px-3 py-3">库存</th>
                <th className="px-3 py-3">状态</th>
                <th className="px-3 py-3">评价</th>
                <th className="px-3 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.slug}</p>
                  </td>
                  <td className="px-3 py-3 text-gray-500">
                    {p.category?.name || "-"}
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium">{formatPrice(p.price)}</p>
                    {p.compareAtPrice && (
                      <p className="text-xs text-gray-400 line-through">
                        {formatPrice(p.compareAtPrice)}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-3">{p.inventory}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                          p.isActive
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {p.isActive ? "上架" : "下架"}
                      </span>
                      {p.isFeatured && (
                        <span className="inline-block rounded-full bg-yellow-50 px-2 py-0.5 text-xs text-yellow-600">
                          精选
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">
                    {p._count.reviews} 条
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => openEdit(p.id)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {deletingId === p.id ? "..." : "删除"}
                      </button>
                    </div>
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
              className="rounded-lg border px-3 py-1 hover:bg-gray-50 disabled:opacity-40"
            >
              上一页
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border px-3 py-1 hover:bg-gray-50 disabled:opacity-40"
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-8">
          <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">
              {editId ? "编辑商品" : "新增商品"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">商品名称 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600">价格 *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">原价（划线价）</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.compareAtPrice}
                    onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">描述 *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  图片链接（一行一个 URL）
                </label>
                <textarea
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none resize-none"
                  placeholder="https://picsum.photos/seed/prod1/800/800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600">分类</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">无分类</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">库存 *</label>
                  <input
                    type="number"
                    value={form.inventory}
                    onChange={(e) => setForm({ ...form, inventory: parseInt(e.target.value) || 0 })}
                    min={0}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="accent-indigo-600"
                  />
                  上架
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="accent-indigo-600"
                  />
                  首页精选
                </label>
              </div>
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
