"use client";

import { useState } from "react";
import { safeParseImages } from "@/lib/utils";

/**
 * 商品图片画廊 — Client Component
 * 支持主图展示 + 缩略图点击切换
 */
export default function ProductImageGallery({
  images,
  productName,
}: {
  images: string;       // JSON 字符串数组
  productName: string;
}) {
  const imageList = safeParseImages(images);
  const [activeIndex, setActiveIndex] = useState(0);
  const mainImage = imageList[activeIndex] || "https://picsum.photos/800/800";

  return (
    <div>
      {/* 主图 */}
      <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
        <img
          src={mainImage}
          alt={productName}
          className="h-full w-full object-cover"
        />
      </div>

      {/* 缩略图列表 */}
      {imageList.length > 1 && (
        <div className="mt-3 flex gap-2">
          {imageList.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors ${
                i === activeIndex
                  ? "border-indigo-500 ring-1 ring-indigo-300"
                  : "border-gray-200 hover:border-indigo-400"
              }`}
            >
              <img
                src={img}
                alt={`${productName} ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
