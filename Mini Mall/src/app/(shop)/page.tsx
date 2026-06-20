import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  // Fetch featured products
  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: 8,
    orderBy: { salesCount: "desc" },
    include: { category: { select: { name: true, slug: true } } },
  });

  // Fetch hot products (by sales)
  const hotProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 4,
    orderBy: { salesCount: "desc" },
    include: { category: { select: { name: true, slug: true } } },
  });

  // Fetch banners
  const banners = await prisma.banner.findMany({
    where: { isActive: true, position: "HOME" },
    orderBy: { sortOrder: "asc" },
  });

  // Fetch categories
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

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
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Hot Products */}
      <section>
        <h2 className="mb-4 text-xl font-bold">🔥 热销排行</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {hotProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

// Simple inline product card for homepage
function ProductCard({
  product,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    images: string;
    salesCount: number;
    category: { name: string; slug: string } | null;
  };
}) {
  const images: string[] = JSON.parse(product.images);
  const mainImage = images[0] || "https://picsum.photos/400/400";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="aspect-square overflow-hidden rounded-t-xl bg-gray-100">
        <img
          src={mainImage}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-medium text-gray-900">
          {product.name}
        </h3>
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
        <p className="mt-1 text-xs text-gray-500">
          已售 {product.salesCount}
        </p>
      </div>
    </Link>
  );
}
