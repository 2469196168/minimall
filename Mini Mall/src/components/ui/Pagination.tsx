"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
}

/**
 * 通用分页导航
 * 通过更新 URL page 参数触发页面刷新
 */
export default function Pagination({ currentPage, totalPages, total }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // 计算显示的页码范围
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const show = 5;
    let start = Math.max(1, currentPage - Math.floor(show / 2));
    const end = Math.min(totalPages, start + show - 1);
    if (end - start + 1 < show) {
      start = Math.max(1, end - show + 1);
    }

    if (start > 1) pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    if (end < totalPages) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
      <span className="text-sm text-gray-500">共 {total} 条</span>
      <nav className="flex items-center gap-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          ←
        </button>
        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                p === currentPage
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          →
        </button>
      </nav>
    </div>
  );
}
