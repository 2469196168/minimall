import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">管理后台</h1>
      <p className="mb-8 text-sm text-gray-500">
        商品、订单、分类、优惠券、轮播图管理 — Phase 7 实现
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-2 text-2xl">📦</div>
          <h3 className="font-semibold text-gray-900">商品管理</h3>
          <p className="mt-1 text-sm text-gray-500">商品 CRUD · 上下架 · 精选推荐</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-2 text-2xl">📋</div>
          <h3 className="font-semibold text-gray-900">订单管理</h3>
          <p className="mt-1 text-sm text-gray-500">订单列表 · 状态变更 · 发货</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-2 text-2xl">📂</div>
          <h3 className="font-semibold text-gray-900">分类管理</h3>
          <p className="mt-1 text-sm text-gray-500">分类 CRUD · 排序</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-2 text-2xl">🎫</div>
          <h3 className="font-semibold text-gray-900">优惠券管理</h3>
          <p className="mt-1 text-sm text-gray-500">优惠券 CRUD · 使用统计</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-2 text-2xl">🎨</div>
          <h3 className="font-semibold text-gray-900">轮播图管理</h3>
          <p className="mt-1 text-sm text-gray-500">轮播图 CRUD · 排序</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-2 text-2xl">👥</div>
          <h3 className="font-semibold text-gray-900">用户管理</h3>
          <p className="mt-1 text-sm text-gray-500">用户列表 · 禁用/启封</p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-indigo-600"
        >
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
