import { type JSX } from "react";

// ======== Props ========
interface SkeletonProps {
  className?: string;
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineShort?: boolean;
}

// ======== 基础 Skeleton ========

/**
 * 通用骨架矩形
 * 用法: <Skeleton className="h-4 w-32" />
 */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  );
}

// ======== 文本骨架 ========

/**
 * 多行文本骨架
 * 用法: <SkeletonText lines={3} />
 */
export function SkeletonText({
  lines = 3,
  className = "",
  lastLineShort = true,
}: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 rounded ${
            lastLineShort && i === lines - 1 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

// ======== 商品卡片骨架 ========

/**
 * 商品卡片骨架（匹配 ProductCard 布局）
 */
export function SkeletonCard() {
  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-3"
      aria-hidden="true"
    >
      {/* 图片区域 */}
      <Skeleton className="aspect-square w-full rounded-lg" />
      {/* 商品名 */}
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      {/* 价格 */}
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

// ======== 表格骨架 ========

/**
 * 表格骨架
 * 用法: <SkeletonTable rows={5} cols={4} />
 */
export function SkeletonTable({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {/* 表头 */}
      <div className="flex gap-4 rounded-lg bg-gray-50 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* 数据行 */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 px-4 py-3">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ======== 详情页骨架 ========

/**
 * 商品详情页骨架
 */
export function SkeletonProductDetail() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2" aria-hidden="true">
      {/* 左侧图片 */}
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-16 rounded-lg" />
          ))}
        </div>
      </div>
      {/* 右侧信息 */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-1/2" />
        <div className="space-y-2 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="pt-4">
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ======== 列表项骨架 ========

/**
 * 订单/购物车列表项骨架
 */
export function SkeletonListItem({ lines = 3 }: { lines?: number }) {
  return (
    <div
      className="flex gap-4 rounded-xl border border-gray-200 p-4"
      aria-hidden="true"
    >
      <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <SkeletonText lines={lines - 1} />
      </div>
    </div>
  );
}
