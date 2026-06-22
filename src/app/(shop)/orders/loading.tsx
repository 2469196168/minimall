import { Skeleton, SkeletonListItem } from "@/components/ui/Skeleton";

export default function OrdersLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">我的订单</h1>

      {/* 状态标签骨架 */}
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-16 rounded-lg" />
        ))}
      </div>

      {/* 订单列表骨架 */}
      <div className="mt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonListItem key={i} lines={4} />
        ))}
      </div>
    </div>
  );
}
