import { SkeletonCard, Skeleton } from "@/components/ui/Skeleton";

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* 搜索栏骨架 */}
      <div className="mb-6">
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />
      </div>

      <div className="flex gap-8">
        {/* 侧边栏骨架 */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="space-y-3">
            <Skeleton className="h-5 w-20" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
        </aside>

        {/* 商品列表骨架 */}
        <main className="flex-1 min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
