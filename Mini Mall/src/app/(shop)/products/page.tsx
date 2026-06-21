import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/product/ProductGrid";
import ProductSearch from "@/components/product/ProductSearch";
import CategoryFilter from "@/components/product/CategoryFilter";
import Pagination from "@/components/ui/Pagination";
import SortSelect from "@/components/product/SortSelect";
import type { ProductCardData } from "@/types";

const PAGE_SIZE = 12;

type SortOption = "newest" | "price_asc" | "price_desc" | "sales";

const SORT_MAP: Record<SortOption, Record<string, string>> = {
  newest: { createdAt: "desc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  sales: { salesCount: "desc" },
};

/**
 * 商品列表页 —— Server Component
 * 支持搜索、分类筛选、排序、分页
 */
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

  // 并行查询商品、总数、分类
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
              <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-gray-100" />}>
                <ProductSearch />
              </Suspense>
            </div>
            <SortSelect currentSort={sort} />
          </div>

          {/* 商品网格 */}
          <ProductGrid products={productsWithRating} />

          {/* 分页 */}
          <div className="mt-8">
            <Suspense fallback={<div className="h-10 animate-pulse rounded bg-gray-100" />}>
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
