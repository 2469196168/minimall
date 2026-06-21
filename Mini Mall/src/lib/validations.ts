import { z } from "zod";

// ======== Auth ========
export const registerSchema = z.object({
  name: z.string().min(2, "昵称至少2个字符").max(20, "昵称最多20个字符"),
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少6位").max(50, "密码最多50位"),
});

export const loginSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少6位"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(20).optional(),
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, "手机号格式不正确")
    .optional()
    .or(z.literal("")),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "请输入旧密码"),
  newPassword: z.string().min(6, "新密码至少6位"),
});

// ======== Product ========
export const productSchema = z.object({
  name: z.string().min(1, "商品名称不能为空"),
  price: z.number().positive("价格必须大于0"),
  description: z.string().min(1, "描述不能为空"),
  categoryId: z.string().optional(),
  inventory: z.number().int().min(0, "库存不能为负数"),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

// ======== Category ========
export const categorySchema = z.object({
  name: z.string().min(1, "分类名称不能为空"),
  icon: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

// ======== Address ========
export const addressSchema = z.object({
  name: z.string().min(2, "收货人姓名至少2个字符"),
  phone: z.string().regex(/^1[3-9]\d{9}$/, "手机号格式不正确"),
  province: z.string().min(1, "请选择省份"),
  city: z.string().min(1, "请选择城市"),
  district: z.string().min(1, "请选择区县"),
  detail: z.string().min(1, "详细地址不能为空"),
  isDefault: z.boolean().optional(),
});

// ======== Review ========
export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  content: z.string().max(500, "评价内容最多500字").optional(),
  images: z.string().optional(),
});

// ======== Coupon ========
export const couponSchema = z.object({
  code: z.string().min(3, "券码至少3个字符").max(20).toUpperCase(),
  name: z.string().min(1, "优惠券名称不能为空"),
  type: z.enum(["FIXED", "PERCENT"]),
  value: z.number().positive("优惠值必须大于0"),
  minOrderAmount: z.number().min(0).default(0),
  usageLimit: z.number().int().min(0).default(0),
  validFrom: z.string().optional(),
  validUntil: z.string().min(1, "请设置过期时间"),
});

export const couponValidateSchema = z.object({
  code: z.string().min(1, "请输入优惠码"),
  orderAmount: z.number().positive(),
});

// ======== Order ========
export const createOrderSchema = z.object({
  addressId: z.string().min(1, "请选择收货地址"),
  couponId: z.string().optional(),
  note: z.string().max(200, "备注最多200字").optional(),
});

// ======== Cart ========
export const addCartItemSchema = z.object({
  productId: z.string().min(1, "商品ID不能为空"),
  quantity: z.number().int().min(1, "数量至少为1").max(999, "数量不能超过999"),
});

export const updateCartItemSchema = z.object({
  productId: z.string().min(1, "商品ID不能为空"),
  quantity: z.number().int().min(0, "数量不能为负数").max(999, "数量不能超过999"),
});

// ======== Wishlist ========
export const wishlistToggleSchema = z.object({
  productId: z.string().min(1, "商品ID不能为空"),
});

// ======== Banner ========
export const bannerSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  image: z.string().min(1, "请上传图片"),
  link: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean(),
  position: z.enum(["HOME", "PRODUCT_LIST"]).default("HOME"),
});
