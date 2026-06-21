import type { ReactNode } from "react";

// ======== Column 定义 ========
export interface Column<T> {
  header: string;
  /** 桌面端渲染 */
  cell: (row: T) => ReactNode;
  /** 移动端卡片标签（如不提供则跳过移动端该字段） */
  mobileLabel?: string;
  /** 移动端卡片值 */
  mobileCell?: (row: T) => ReactNode;
  /** 桌面端列宽 */
  className?: string;
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  /** 移动端卡片顶部的标题字段（加粗显示） */
  mobileTitle?: (row: T) => ReactNode;
  /** 空数据提示 */
  emptyMessage?: string;
}

/**
 * 响应式表格
 * - 桌面端 (lg+)：标准 HTML table
 * - 移动端：卡片堆叠，每张卡片显示 mobileLabel: mobileCell 键值对
 */
export default function ResponsiveTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  mobileTitle,
  emptyMessage = "暂无数据",
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* 桌面端 Table */}
      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-left font-medium text-gray-600 ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={String(row[keyField])} className="border-t hover:bg-gray-50">
                {columns.map((col, i) => (
                  <td key={i} className={`px-4 py-3 ${col.className || ""}`}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 移动端 Cards */}
      <div className="space-y-3 lg:hidden">
        {data.map((row) => (
          <div
            key={String(row[keyField])}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            {mobileTitle && (
              <div className="mb-2 font-medium text-gray-900">
                {mobileTitle(row)}
              </div>
            )}
            <div className="space-y-1.5">
              {columns
                .filter((col) => col.mobileLabel && col.mobileCell)
                .map((col, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 text-sm">
                    <span className="shrink-0 text-gray-400">{col.mobileLabel}</span>
                    <span className="text-right text-gray-700">{col.mobileCell!(row)}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
