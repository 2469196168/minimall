/**
 * 星级评分展示组件
 * 显示星级（实心/半星/空心）和可选的评价数
 */
export default function StarRating({
  rating,
  count,
  showCount = false,
}: {
  rating: number;   // 0-5
  count?: number;   // 评价总数
  showCount?: boolean;
}) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5 text-sm">
      {Array.from({ length: fullStars }, (_, i) => (
        <span key={`full-${i}`} className="text-yellow-500">★</span>
      ))}
      {hasHalf && (
        <span className="relative inline-block text-gray-300">
          <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
            <span className="text-yellow-500">★</span>
          </span>
          ★
        </span>
      )}
      {Array.from({ length: emptyStars }, (_, i) => (
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      ))}
      {showCount && count !== undefined && (
        <span className="ml-1 text-xs text-gray-500">({count})</span>
      )}
    </span>
  );
}
