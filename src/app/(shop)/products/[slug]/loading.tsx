import { SkeletonProductDetail } from "@/components/ui/Skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <SkeletonProductDetail />
    </div>
  );
}
