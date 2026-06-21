// ======== API Response ========
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

// ======== User ========
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  phone: string | null;
  createdAt: Date;
}

// ======== Product ========
export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  images: string;
  category: { name: string; slug: string } | null;
  salesCount: number;
  avgRating: number;       // 新增：平均评分，0-5
  reviewCount: number;     // 新增：评价数量
}

// ======== Cart ========
export interface CartItemData {
  id: string;
  quantity: number;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string;
    inventory: number;
    isActive: boolean;
  };
}

// ======== Order ========
export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
  PENDING: "待付款",
  PAID: "已付款",
  SHIPPED: "已发货",
  DELIVERED: "已完成",
  CANCELLED: "已取消",
};
