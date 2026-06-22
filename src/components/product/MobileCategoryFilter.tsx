"use client";

import { useState } from "react";
import CategoryFilter from "./CategoryFilter";

interface CategoryItem {
  slug: string;
  name: string;
  icon: string | null;
  _count: number;
}

interface MobileCategoryFilterProps {
  categories: CategoryItem[];
  currentCategory: string;
}

/**
 * 移动端分类筛选 —— 折叠面板
 * 仅在 lg 以下显示（lg:hidden）
 */
export default function MobileCategoryFilter({
  categories,
  currentCategory,
}: MobileCategoryFilterProps) {
  const [open, setOpen] = useState(false);

  // 当前激活的分类名
  const activeLabel = currentCategory
    ? categories.find((c) => c.slug === currentCategory)?.name || currentCategory
    : "全部分类";

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <span className="flex items-center gap-2">
          <span>📂</span>
          {activeLabel}
          {currentCategory && (
            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs text-indigo-600">
              已筛选
            </span>
          )}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
          <CategoryFilter
            categories={categories}
            currentCategory={currentCategory}
          />
        </div>
      )}
    </div>
  );
}
