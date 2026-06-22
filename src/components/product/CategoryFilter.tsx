"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

type CategoryItem = {
  slug: string;
  name: string;
  icon: string | null;
  _count: number;
};

interface CategoryFilterProps {
  categories: CategoryItem[];
  currentCategory: string;
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
    params.delete("page");
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
