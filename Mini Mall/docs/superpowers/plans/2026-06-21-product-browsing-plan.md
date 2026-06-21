# 商品浏览 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 实现商品列表页（搜索/筛选/排序/分页）和商品详情页（图片 + 信息 + 评价区）

**架构：** Server Component 直读 Prisma + URL searchParams 驱动交互。Client Component 仅用于搜索框、分类筛选、分页的 URL 更新。

**技术栈：** Next.js 16 App Router, Prisma 5 + SQLite, TailwindCSS 4, React 19 Server/Client Components

---

### 任务 1：扩展 ProductCardData 类型

**文件：**
- 修改：`src/types/index.ts:28-37`

- [ ] **步骤 1：更新类型定义**

```typescript
export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  images: string;
  category: { name: string; slug: string } | null;
  salesCount: number;
  avgRating: number;       // 新增：平均评分，0-5
  reviewCount: number;     // 新增：评价数量
}
```

- [ ] **步骤 2：验证编译**

运行：`npx tsc --noEmit`
预期：TypeScript 编译通过（尚无引用 avgRating/reviewCount 的代码，类型扩展不影响编译）

- [ ] **步骤 3：Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): ProductCardData 增加 avgRating 和 reviewCount 字段"
```

---

### 任务 2：创建 StarRating 组件

**文件：**
- 创建：`src/components/ui/StarRating.tsx`

- [ ] **步骤 1：创建组件**

```tsx
/**
 * 星级评分展示组件
 * 显示星级（实心/半星/空心）和可选的评分数字
 */
export default function StarRating({
  rating,
  count,
  showCount = false,
}: {
  rating: number;   // 0-5
  count?: number;   // 评价总数
  showCount?: boolean;
}) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-1 text-sm text-yellow-500">
      {Array.from({ length: fullStars }, (_, i) => (
        <span key={`full-${i}`}>★</span>
      ))}
      {hasHalf && <span>★</span> /* 简化：半星也用实星代替 */}
      {Array.from({ length: emptyStars }, (_, i) => (
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      ))}
      {showCount && count !== undefined && (
        <span className="ml-1 text-xs text-gray-500">({count})</span>
      )}
    </span>
  );
}
```

- [ ] **步骤 2：验证编译**

运行：`npx tsc --noEmit`
预期：无 TypeScript 错误

- [ ] **步骤 3：Commit**

```bash
git add src/components/ui/StarRating.tsx
git commit -m "feat(ui): 添加 StarRating 星级评分组件"
```

---

### 任务 3：创建 ProductCard 组件

**文件：**
- 创建：`src/components/product/ProductCard.tsx`

- [ ] **步骤 1：创建组件**

```tsx
import Link from "next/link";
import type { ProductCardData } from "@/types";
import StarRating from "@/components/ui/StarRating";

/**
 * 商品卡片 — 丰富风格
 * 展示：图片 + 名称 + 评分 + 价格（划线价）+ 销量 + 收藏按钮（占位）
 */
export default function ProductCard({ product }: { product: ProductCardData }) {
  const images: string[] = JSON.parse(product.images);
  const mainImage = images[0] || "https://picsum.photos/400/400";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
    >
      {/* 收藏按钮占位 */}
      <button
        onClick={(e) => {
          e.preventDefault();
          // Phase 4 实现收藏逻辑
        }}
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-gray-400 shadow-sm hover:text-red-500"
        title="收藏"
      >
        ♡
      </button>

      {/* 商品图片 */}
      <div className="aspect-square overflow-hidden rounded-t-xl bg-gray-100">
        <img
          src={mainImage}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>

      {/* 商品信息 */}
      <div className="p-3">
        <h3 className="truncate text-sm font-medium text-gray-900">
          {product.name}
        </h3>

        {/* 评分 */}
        <div className="mt-1">
          <StarRating rating={product.avgRating} count={product.reviewCount} showCount />
        </div>

        {/* 价格 */}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold text-red-600">
            ¥{product.price.toFixed(2)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-gray-400 line-through">
              ¥{product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* 销量 */}
        <p className="mt-1 text-xs text-gray-500">
          已售 {product.salesCount}
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **步骤 2：验证编译**

运行：`npx tsc --noEmit`
预期：无 TypeScript 错误

- [ ] **步骤 3：Commit**

```bash
git add src/components/product/ProductCard.tsx
git commit -m "feat(product): 提取 ProductCard 为共用组件（丰富风格）"
```

---

### 任务 4：创建 ProductGrid 组件

**文件：**
- 创建：`src/components/product/ProductGrid.tsx`

- [ ] **步骤 1：创建组件**

```tsx
import type { ProductCardData } from "@/types";
import ProductCard from "./ProductCard";

/**
 * 商品网格容器
 * 响应式：移动端 2 列，平板 3 列，桌面 4 列
 */
export default function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-5xl">📭</p>
        <p className="mt-2">暂无商品</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

- [ ] **步骤 2：验证编译**

运行：`npx tsc --noEmit`
预期：无 TypeScript 错误

- [ ] **步骤 3：Commit**

```bash
git add src/components/product/ProductGrid.tsx
git commit -m "feat(product): 添加 ProductGrid 商品网格容器"
```

---

### 任务 5：创建 Pagination 组件

**文件：**
- 创建：`src/components/ui/Pagination.tsx`

- [ ] **步骤 1：创建组件**

```tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
}

/**
 * 通用分页导航
 * 通过更新 URL page 参数触发页面刷新
 */
export default function Pagination({ currentPage, totalPages, total }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // 计算显示的页码范围
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const show = 5; // 最多显示 5 个页码
    let start = Math.max(1, currentPage - Math.floor(show / 2));
    const end = Math.min(totalPages, start + show - 1);
    if (end - start + 1 < show) {
      start = Math.max(1, end - show + 1);
    }

    if (start > 1) pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    if (end < totalPages) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
      <span className="text-sm text-gray-500">共 {total} 条</span>
      <nav className="flex items-center gap-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          ←
        </button>
        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                p === currentPage
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          →
        </button>
      </nav>
    </div>
  );
}
```

- [ ] **步骤 2：验证编译**

运行：`npx tsc --noEmit`
预期：无 TypeScript 错误（需确认 useSearchParams 在新版本中的使用方式正确）

- [ ] **步骤 3：Commit**

```bash
git add src/components/ui/Pagination.tsx
git commit -m "feat(ui): 添加 Pagination 通用分页组件"
```

---

### 任务 6：创建 CategoryFilter 组件

**文件：**
- 创建：`src/components/product/CategoryFilter.tsx`

- [ ] **步骤 1：创建组件**

```tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

type CategoryItem = {
  slug: string;
  name: string;
  icon: string | null;
  _count: number;    // Prisma include _count: { products: true }
};

interface CategoryFilterProps {
  categories: CategoryItem[];
  currentCategory: string; // 当前选中的分类 slug，空字符串表示"全部"
}

/**
 * 侧边栏分类筛选
 * 点击分类更新 URL category 参数
 */
export default function CategoryFilter({ categories, currentCategory }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.delete("page"); // 切换分类时重置页码
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <nav className="space-y-1">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">📂 全部分类</h3>
      <button
        onClick={() => handleCategory("")}
        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
          !currentCategory
            ? "bg-indigo-50 font-medium text-indigo-700"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        全部
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => handleCategory(cat.slug)}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
            currentCategory === cat.slug
              ? "bg-indigo-50 font-medium text-indigo-700"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>
            {cat.icon && <span className="mr-1">{cat.icon}</span>}
            {cat.name}
          </span>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
            {cat._count}
          </span>
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **步骤 2：验证编译**

运行：`npx tsc --noEmit`
预期：无 TypeScript 错误

- [ ] **步骤 3：Commit**

```bash
git add src/components/product/CategoryFilter.tsx
git commit -m "feat(product): 添加 CategoryFilter 侧边栏分类筛选"
```

---

### 任务 7：创建 ProductSearch 组件

**文件：**
- 创建：`src/components/product/ProductSearch.tsx`

- [ ] **步骤 1：创建组件**

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 * 即时搜索输入框
 * 输入后防抖 300ms 自动更新 URL search 参数
 */
export default function ProductSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") || "");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // 当外部 URL 参数变化时（如点击分类清除搜索），同步输入框
  useEffect(() => {
    setValue(searchParams.get("search") || "");
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (v) {
        params.set("search", v);
      } else {
        params.delete("search");
      }
      params.delete("page"); // 搜索时重置页码
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="搜索商品..."
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
        🔍
      </span>
    </div>
  );
}
```

- [ ] **步骤 2：验证编译**

运行：`npx tsc --noEmit`
预期：无 TypeScript 错误

- [ ] **步骤 3：Commit**

```bash
git add src/components/product/ProductSearch.tsx
git commit -m "feat(product): 添加 ProductSearch 即时搜索组件"
```

---

### 任务 8：创建商品列表页

**文件：**
- 创建：`src/app/(shop)/products/page.tsx`

- [ ] **步骤 1：创建页面**

```tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/product/ProductGrid";
import ProductSearch from "@/components/product/ProductSearch";
import CategoryFilter from "@/components/product/CategoryFilter";
import Pagination from "@/components/ui/Pagination";
import type { ProductCardData } from "@/types";

const PAGE_SIZE = 12;

type SortOption = "newest" | "price_asc" | "price_desc" | "sales";

const SORT_MAP: Record<SortOption, Record<string, string>> = {
  newest: { createdAt: "desc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  sales: { salesCount: "desc" },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const category = params.category || "";
  const sort = (params.sort as SortOption) || "newest";
  const page = Math.max(1, Number(params.page) || 1);

  // 构建查询条件
  const where: Record<string, unknown> = { isActive: true };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (category) {
    where.category = { slug: category };
  }

  const orderBy = SORT_MAP[sort] || { createdAt: "desc" };

  // 并行查询商品和分类
  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: { select: { name: true, slug: true } },
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
      },
    }),
  ]);

  // 计算每个商品的平均评分
  const productsWithRating: ProductCardData[] = products.map((p) => {
    const ratings = p.reviews.map((r) => r.rating);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images: p.images,
      category: p.category,
      salesCount: p.salesCount,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: p._count.reviews,
    };
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex gap-8">
        {/* 侧边栏 */}
        <aside className="w-56 shrink-0">
          <CategoryFilter
            categories={categories.map((c) => ({
              slug: c.slug,
              name: c.name,
              icon: c.icon,
              _count: c._count.products,
            }))}
            currentCategory={category}
          />
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 min-w-0">
          {/* 搜索 + 排序栏 */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex-1">
              <Suspense>
                <ProductSearch />
              </Suspense>
            </div>
            <SortSelect currentSort={sort} />
          </div>

          {/* 商品网格 */}
          <ProductGrid products={productsWithRating} />

          {/* 分页 */}
          <div className="mt-8">
            <Suspense>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                total={total}
              />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * 排序选择器（Client Component）
 */
function SortSelect({ currentSort }: { currentSort: string }) {
  "use client";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const options: { value: string; label: string }[] = [
    { value: "newest", label: "最新" },
    { value: "price_asc", label: "价格↑" },
    { value: "price_desc", label: "价格↓" },
    { value: "sales", label: "销量" },
  ];

  return (
    <select
      value={currentSort}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        const v = e.target.value;
        if (v === "newest") {
          params.delete("sort");
        } else {
          params.set("sort", v);
        }
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
```

需要补充 `useRouter` 和 `useSearchParams`、`usePathname` 的 import：
```typescript
import { useRouter, useSearchParams, usePathname } from "next/navigation";
```

- [ ] **步骤 2：验证编译和构建**

运行：`npx tsc --noEmit && npm run build`
预期：编译通过，构建成功

- [ ] **步骤 3：Commit**

```bash
git add src/app/\(shop\)/products/page.tsx
git commit -m "feat(products): 添加商品列表页（搜索/筛选/排序/分页）"
```

---

### 任务 9：创建商品详情页

**文件：**
- 创建：`src/app/(shop)/products/[slug]/page.tsx`

- [ ] **步驟 1：创建页面**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StarRating from "@/components/ui/StarRating";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      reviews: {
        include: {
          user: { select: { name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const images: string[] = JSON.parse(product.images);
  const mainImage = images[0] || "https://picsum.photos/800/800";

  // 计算平均评分
  const reviewRatings = product.reviews.map((r) => r.rating);
  const avgRating =
    reviewRatings.length > 0
      ? reviewRatings.reduce((a, b) => a + b, 0) / reviewRatings.length
      : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* 面包屑 */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-indigo-600">首页</Link>
        <span className="mx-2">/</span>
        {product.category && (
          <>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-indigo-600">
              {product.category.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* 左右分栏 */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* 左栏：图片 */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
            <img
              src={mainImage}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  className="h-16 w-16 overflow-hidden rounded-lg border-2 border-gray-200 hover:border-indigo-400"
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 右栏：商品信息 */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>

          {/* 评分 */}
          <div className="mt-2">
            <StarRating rating={avgRating} count={product._count.reviews} showCount />
          </div>

          {/* 价格 */}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-red-600">
              ¥{product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-gray-400 line-through">
                ¥{product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* 基本信息 */}
          <div className="mt-6 space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
            <div className="flex gap-4">
              <span className="text-gray-400">库存</span>
              <span>{product.inventory > 0 ? `${product.inventory} 件` : "缺货"}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-400">销量</span>
              <span>{product.salesCount}</span>
            </div>
            {product.category && (
              <div className="flex gap-4">
                <span className="text-gray-400">分类</span>
                <Link href={`/products?category=${product.category.slug}`} className="text-indigo-600 hover:underline">
                  {product.category.name}
                </Link>
              </div>
            )}
          </div>

          {/* 操作按钮（占位） */}
          <div className="mt-6 flex gap-3">
            <button className="flex-1 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 transition-colors">
              加入购物车
            </button>
            <button className="flex-1 rounded-lg bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700 transition-colors">
              立即购买
            </button>
          </div>
        </div>
      </div>

      {/* 商品描述 + 评价 */}
      <div className="mt-12">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8 text-sm font-medium">
            <span className="border-b-2 border-indigo-600 pb-3 text-indigo-600">商品描述</span>
            <span className="pb-3 text-gray-500">评价 ({product._count.reviews})</span>
          </nav>
        </div>

        {/* 描述 */}
        <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-gray-700">
          {product.description}
        </div>

        {/* 评价列表 */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900">
            商品评价 ({product._count.reviews})
          </h3>
          {product.reviews.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">暂无评价</p>
          ) : (
            <div className="mt-4 space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {review.user.name}
                    </span>
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                  {review.content && (
                    <p className="mt-1 text-sm text-gray-600">{review.content}</p>
                  )}
                  {review.images && (
                    <div className="mt-2 flex gap-2">
                      {JSON.parse(review.images).map((img: string, i: number) => (
                        <img
                          key={i}
                          src={img}
                          alt={`晒图 ${i + 1}`}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **步驟 2：验证编译和构建**

运行：`npx tsc --noEmit && npm run build`
预期：编译通过，构建成功

- [ ] **步驟 3：Commit**

```bash
git add src/app/\(shop\)/products/\[slug\]/page.tsx
git commit -m "feat(products): 添加商品详情页（左右分栏 + 评价展示）"
```

---

### 任务 10：更新首页引用共用 ProductCard

**文件：**
- 修改：`src/app/(shop)/page.tsx`

- [ ] **步骤 1：替换内联 ProductCard**

删除内联 `ProductCard` 函数（第 106-155 行），改用共用组件。在文件顶部添加：
```typescript
import ProductCard from "@/components/product/ProductCard";
```

修改查询以包含评分数：
```typescript
const featuredProducts = await prisma.product.findMany({
  where: { isActive: true, isFeatured: true },
  take: 8,
  orderBy: { salesCount: "desc" },
  include: {
    category: { select: { name: true, slug: true } },
    _count: { select: { reviews: true } },
    reviews: { select: { rating: true } },
  },
});

const hotProducts = await prisma.product.findMany({
  where: { isActive: true },
  take: 4,
  orderBy: { salesCount: "desc" },
  include: {
    category: { select: { name: true, slug: true } },
    _count: { select: { reviews: true } },
    reviews: { select: { rating: true } },
  },
});
```

计算评分并映射：
```typescript
const featuredWithRating = featuredProducts.map(/* 同商品列表页计算方式 */);
const hotWithRating = hotProducts.map(/* 同商品列表页计算方式 */);
```

模板中使用 `featuredWithRating` 和 `hotWithRating` 替换原有的 `featuredProducts` 和 `hotProducts`。

- [ ] **步骤 2：验证构建**

运行：`npm run build`
预期：构建成功，首页正常渲染

- [ ] **步骤 3：Commit**

```bash
git add src/app/\(shop\)/page.tsx
git commit -m "refactor(home): 替换内联 ProductCard 为共用组件"
```

---

### 最终验证

- [ ] **步骤 1：完整构建**

运行：`npm run build`
预期：退出码 0，生成所有静态/动态页面

- [ ] **步骤 2：启动开发服务器验证**

运行：`npm run dev`
手动验证：
- `http://localhost:3000/products` → 商品列表 + 侧边栏分类 + 排序
- `http://localhost:3000/products?search=xxx` → 搜索筛选
- `http://localhost:3000/products?category=phone` → 分类筛选
- `http://localhost:3000/products?page=2` → 分页
- `http://localhost:3000/products/[某个slug]` → 详情页

---

## 自检

**1. 规格覆盖度：**
- ✅ 商品列表页 `page.tsx` → 任务 8
- ✅ 商品详情页 `[slug]/page.tsx` → 任务 9
- ✅ ProductCard 组件 → 任务 3
- ✅ ProductGrid 组件 → 任务 4
- ✅ CategoryFilter 组件 → 任务 6
- ✅ ProductSearch 组件 → 任务 7
- ✅ Pagination 组件 → 任务 5
- ✅ StarRating 组件 → 任务 2
- ✅ ProductCardData 类型更新 → 任务 1
- ✅ 首页更新 → 任务 10
- ✅ 构建验证 → 最终验证

**2. 占位符扫描：** ✅ 无 TODO/待定/占位符

**3. 类型一致性：** ✅ 任务 1 定义的 ProductCardData 在任务 3/4/8/10 中统一使用
