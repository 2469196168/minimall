"use client";

import { useRouter } from "next/navigation";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";

/**
 * 商品详情页收藏按钮
 * 显示是否已收藏状态，点击 toggle
 */
export default function WishlistToggle({ productId }: { productId: string }) {
  const { isWished, toggle } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();

  const wished = isWished(productId);

  const handleToggle = async () => {
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    await toggle(productId);
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
        wished
          ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-gray-300 bg-white text-gray-600 hover:border-red-300 hover:text-red-500"
      }`}
    >
      <span className={wished ? "text-red-500" : ""}>{wished ? "♥" : "♡"}</span>
      {wished ? "已收藏" : "加入收藏"}
    </button>
  );
}
