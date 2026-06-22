import type { ProductCardData } from "@/types";
import ProductCard from "./ProductCard";

/**
 * 商品网格容器
 * 响应式：移动端 2 列，平板 3 列，桌面 4 列
 */
export default function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-5xl">📭</p>
        <p className="mt-2">暂无商品</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
