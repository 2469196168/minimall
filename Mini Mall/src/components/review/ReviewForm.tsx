"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ReviewFormProps {
  productId: string;
  onSubmitted: () => void;
}

/**
 * 评价表单组件
 * 仅已购买且已收货 + 未评价的用户可见
 */
export default function ReviewForm({ productId, onSubmitted }: ReviewFormProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [canReview, setCanReview] = useState(false);
  const [checking, setChecking] = useState(true);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 检查是否可以评价
  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }

    // 调用订单 API 检查是否已购买且已收货
    fetch(`/api/orders?status=DELIVERED`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const hasDelivered = d.data.some((order: { items: { productId: string }[] }) =>
            order.items.some((item) => item.productId === productId)
          );
          setCanReview(hasDelivered);
        }
      })
      .finally(() => setChecking(false));
  }, [user, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating < 1 || rating > 5) {
      setError("请选择评分");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          content: content.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setContent("");
        onSubmitted();
        // 延迟刷新页面，让 Server Component 重新获取评价数据
        setTimeout(() => router.refresh(), 1500);
      } else {
        setError(data.error || "发表评价失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  // 未登录 → 提示登录
  if (!authLoading && !user) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400">
        请<a href="/login" className="text-indigo-600 hover:underline mx-1">登录</a>后发表评价
      </div>
    );
  }

  // 加载中
  if (authLoading || checking) {
    return null;
  }

  // 已成功提交
  if (success) {
    return (
      <div className="mt-6 rounded-lg border border-green-300 bg-green-50 p-4 text-center text-sm text-green-700">
        ✅ 评价发表成功！感谢您的反馈。
      </div>
    );
  }

  // 不可评价
  if (!canReview) {
    return null;
  }

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="text-sm font-semibold text-gray-900">发表评价</h4>
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        {/* 星级选择 */}
        <div>
          <label className="text-xs text-gray-500">评分</label>
          <div className="mt-1 flex gap-1 text-2xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-colors"
              >
                <span
                  className={
                    star <= (hoverRating || rating)
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 评价内容 */}
        <div>
          <label className="text-xs text-gray-500">评价内容（选填）</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="写下您对这件商品的感受..."
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
          <p className="text-right text-xs text-gray-400">{content.length}/500</p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "提交中..." : "发表评价"}
        </button>
      </form>
    </div>
  );
}
