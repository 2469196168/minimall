import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product/ProductCard";
import type { ProductCardData } from "@/types";
import { computeAvgRating } from "@/lib/utils";

/**
 * 将 Prisma 商品查询结果映射为 ProductCardData
 */
function mapToCardData(
  p: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    images: string;
    salesCount: number;
    category: { name: string; slug: string } | null;
    reviews: { rating: number }[];
    _count: { reviews: number };
  }
): ProductCardData {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images,
    category: p.category,
    salesCount: p.salesCount,
    avgRating: computeAvgRating(p.reviews),
    reviewCount: p._count.reviews,
  };
}

export default async function HomePage() {
  // 精选推荐商品
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

  // 热销商品
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

  // 轮播
  const banners = await prisma.banner.findMany({
    where: { isActive: true, position: "HOME" },
    orderBy: { sortOrder: "asc" },
  });

  // 分类
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const featuredWithRating = featuredProducts.map(mapToCardData);
  const hotWithRating = hotProducts.map(mapToCardData);

  return (
    <div className="space-y-10">
      {/* Banner Carousel */}
      {banners.length > 0 && (
        <div className="overflow-hidden rounded-xl">
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {banners.map((banner) => (
              <Link
                key={banner.id}
                href={banner.link || "#"}
                className="relative min-w-full snap-center"
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="h-64 w-full rounded-xl object-cover"
                />
                <div className="absolute bottom-4 left-4 rounded-lg bg-black/50 px-4 py-2 text-white">
                  {banner.title}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Category Navigation */}
      <section>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-100 hover:text-indigo-700"
          >
            全部
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-100 hover:text-indigo-700"
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="mb-4 text-xl font-bold">✨ 精选推荐</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featuredWithRating.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Hot Products */}
      <section>
        <h2 className="mb-4 text-xl font-bold">🔥 热销排行</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {hotWithRating.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
