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
