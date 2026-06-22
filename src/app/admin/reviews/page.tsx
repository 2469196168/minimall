"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StarRating from "@/components/ui/StarRating";
import { safeParseImages } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  content: string | null;
  images: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
  product: { id: string; name: string; slug: string; images: string };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReviews = () => {
    setLoading(true);
    fetch(`/api/admin/reviews?page=${page}&pageSize=20`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setReviews(d.data.items);
          setTotalPages(d.data.totalPages);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这条评价吗？此操作不可恢复。")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
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
      <h1 className="text-2xl font-bold text-gray-900">评价管理</h1>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400 animate-pulse">加载中...</div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
            暂无评价
          </div>
        ) : (
          reviews.map((review) => {
            const productImages = safeParseImages(review.product.images);
            const reviewImages = review.images ? safeParseImages(review.images) : [];

            return (
              <div
                key={review.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  {/* 商品缩略图 */}
                  <Link href={`/products/${review.product.slug}`} className="shrink-0">
                    <img
                      src={productImages[0] || "https://picsum.photos/80/80"}
                      alt={review.product.name}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${review.product.slug}`}
                        className="text-sm font-medium text-gray-900 hover:text-indigo-600 truncate"
                      >
                        {review.product.name}
                      </Link>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-gray-400">
                        — {review.user.name}
                      </span>
                    </div>
                    {review.content && (
                      <p className="mt-1 text-sm text-gray-600">{review.content}</p>
                    )}
                    {reviewImages.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {reviewImages.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`晒图${i + 1}`}
                            className="h-12 w-12 rounded object-cover"
                          />
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="shrink-0 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    {deletingId === review.id ? "删除中..." : "删除"}
                  </button>
                </div>
              </div>
            );
          })
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
              className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
