"use client";

import { useState, useEffect } from "react";

interface Banner {
  id: string;
  title: string;
  image: string;
  link: string | null;
  sortOrder: number;
  isActive: boolean;
  position: string;
}

interface BannerForm {
  title: string;
  image: string;
  link: string;
  sortOrder: number;
  isActive: boolean;
  position: string;
}

const EMPTY_FORM: BannerForm = {
  title: "",
  image: "",
  link: "",
  sortOrder: 0,
  isActive: true,
  position: "HOME",
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBanners = () => {
    setLoading(true);
    fetch("/api/admin/banners")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBanners(d.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBanners(); }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const openEdit = (b: Banner) => {
    setEditId(b.id);
    setForm({
      title: b.title,
      image: b.image,
      link: b.link || "",
      sortOrder: b.sortOrder,
      isActive: b.isActive,
      position: b.position,
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.image) {
      setError("请填写标题和图片链接");
      return;
    }

    setSaving(true);
    try {
      const url = editId ? `/api/admin/banners/${editId}` : "/api/admin/banners";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, link: form.link || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        fetchBanners();
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
    if (!confirm("确定删除此轮播图吗？")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchBanners();
      else alert(data.error || "删除失败");
    } catch { alert("网络错误"); }
    finally { setDeletingId(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">轮播图管理</h1>
        <button onClick={openAdd} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">+ 新增轮播</button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full p-8 text-center text-sm text-gray-400 animate-pulse">加载中...</div>
        ) : banners.length === 0 ? (
          <div className="col-span-full p-8 text-center text-sm text-gray-400">暂无轮播图</div>
        ) : (
          banners.map((b) => (
            <div key={b.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <img src={b.image} alt={b.title} className="h-36 w-full object-cover" />
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm text-gray-900">{b.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${b.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {b.isActive ? "启用" : "停用"}
                  </span>
                </div>
                {b.link && <p className="mt-1 text-xs text-gray-400 truncate">{b.link}</p>}
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                  <span>位置: {b.position}</span>
                  <span>排序: {b.sortOrder}</span>
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <button onClick={() => openEdit(b)} className="text-indigo-600 hover:text-indigo-800">编辑</button>
                  <button onClick={() => handleDelete(b.id)} disabled={deletingId === b.id} className="text-red-500 hover:text-red-700 disabled:opacity-50">{deletingId === b.id ? "..." : "删除"}</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-8">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">{editId ? "编辑轮播" : "新增轮播"}</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">标题 *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">图片链接 *</label>
                <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required placeholder="https://picsum.photos/1200/400" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none" />
                {form.image && (
                  <img src={form.image} alt="预览" className="mt-2 h-20 w-full rounded object-cover" />
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">跳转链接</label>
                <input type="text" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/products?category=phone" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600">位置</label>
                  <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                    <option value="HOME">首页</option>
                    <option value="PRODUCT_LIST">商品列表</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">排序</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} min={0} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-indigo-600" /> 启用
              </label>
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
