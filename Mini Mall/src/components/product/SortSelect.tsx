"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * 排序选择器 —— Client Component
 * 通过更新 URL sort 参数切换排序方式
 */
export default function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const options: { value: string; label: string }[] = [
    { value: "newest", label: "最新" },
    { value: "price_asc", label: "价格↑" },
    { value: "price_desc", label: "价格↓" },
    { value: "sales", label: "销量" },
  ];

  return (
    <select
      value={currentSort}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        const v = e.target.value;
        if (v === "newest") {
          params.delete("sort");
        } else {
          params.set("sort", v);
        }
        params.delete("page"); // 切换排序时重置页码
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
