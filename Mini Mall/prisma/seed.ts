import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ======== 1. Create Admin User ========
  const adminHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@minimall.com" },
    update: {},
    create: {
      email: "admin@minimall.com",
      name: "Admin",
      passwordHash: adminHash,
      role: "ADMIN",
      phone: "13800000000",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // ======== 2. Create Test Customer ========
  const customerHash = await bcrypt.hash("user123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "user@minimall.com" },
    update: {},
    create: {
      email: "user@minimall.com",
      name: "Test User",
      passwordHash: customerHash,
      role: "CUSTOMER",
      phone: "13900000001",
    },
  });
  console.log("✅ Test customer created:", customer.email);

  // ======== 3. Create Categories ========
  const categories = [
    { name: "手机数码", slug: "phone-digital", icon: "📱", sortOrder: 1 },
    { name: "电脑办公", slug: "computer-office", icon: "💻", sortOrder: 2 },
    { name: "家用电器", slug: "home-appliance", icon: "🏠", sortOrder: 3 },
    { name: "服装鞋帽", slug: "clothing", icon: "👗", sortOrder: 4 },
    { name: "食品生鲜", slug: "food", icon: "🍎", sortOrder: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories created:", categories.length);

  // ======== 4. Create Products ========
  const allCategories = await prisma.category.findMany();
  const products = [
    {
      name: "iPhone 16 Pro Max",
      slug: "iphone-16-pro-max",
      description:
        "苹果最新旗舰手机，搭载A18 Pro芯片，4800万像素主摄，支持5G。超大屏幕，超强续航，钛金属机身。",
      price: 9999,
      compareAtPrice: 10999,
      images: JSON.stringify([
        "https://picsum.photos/seed/iphone16-1/800/800",
        "https://picsum.photos/seed/iphone16-2/800/800",
      ]),
      categoryId: allCategories[0].id,
      inventory: 100,
      salesCount: 256,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "华为 Mate 70 Pro",
      slug: "huawei-mate-70-pro",
      description:
        "华为旗舰手机，麒麟芯片，卫星通信，XMAGE影像系统，鸿蒙操作系统。",
      price: 7999,
      compareAtPrice: 8999,
      images: JSON.stringify([
        "https://picsum.photos/seed/mate70-1/800/800",
        "https://picsum.photos/seed/mate70-2/800/800",
      ]),
      categoryId: allCategories[0].id,
      inventory: 80,
      salesCount: 189,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "小米 15 Ultra",
      slug: "xiaomi-15-ultra",
      description: "小米旗舰，骁龙8 Gen 4，徕卡光学镜头，120W快充。",
      price: 5999,
      compareAtPrice: 6499,
      images: JSON.stringify([
        "https://picsum.photos/seed/xiaomi15-1/800/800",
        "https://picsum.photos/seed/xiaomi15-2/800/800",
      ]),
      categoryId: allCategories[0].id,
      inventory: 120,
      salesCount: 312,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "MacBook Pro 16英寸 M4",
      slug: "macbook-pro-16-m4",
      description:
        "苹果专业级笔记本电脑，M4 Pro芯片，32GB内存，Liquid Retina XDR显示屏。",
      price: 19999,
      compareAtPrice: 21499,
      images: JSON.stringify([
        "https://picsum.photos/seed/macbook-1/800/800",
        "https://picsum.photos/seed/macbook-2/800/800",
      ]),
      categoryId: allCategories[1].id,
      inventory: 30,
      salesCount: 78,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "ThinkPad X1 Carbon Gen 12",
      slug: "thinkpad-x1-carbon-gen12",
      description:
        "联想商务旗舰笔记本，酷睿Ultra 7处理器，14英寸2.8K OLED屏，轻薄坚固。",
      price: 12999,
      compareAtPrice: null,
      images: JSON.stringify([
        "https://picsum.photos/seed/thinkpad-1/800/800",
        "https://picsum.photos/seed/thinkpad-2/800/800",
      ]),
      categoryId: allCategories[1].id,
      inventory: 50,
      salesCount: 45,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "戴森 V16 无线吸尘器",
      slug: "dyson-v16-vacuum",
      description:
        "戴森最新无线吸尘器，数字马达，激光探测微尘，60分钟续航。",
      price: 4999,
      compareAtPrice: 5999,
      images: JSON.stringify([
        "https://picsum.photos/seed/dyson-1/800/800",
        "https://picsum.photos/seed/dyson-2/800/800",
      ]),
      categoryId: allCategories[2].id,
      inventory: 200,
      salesCount: 523,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Sony WH-1000XM6 降噪耳机",
      slug: "sony-wh1000xm6",
      description:
        "索尼旗舰无线降噪耳机，40小时续航，Hi-Res音质，自适应降噪。",
      price: 2499,
      compareAtPrice: 2999,
      images: JSON.stringify([
        "https://picsum.photos/seed/sonyxm6-1/800/800",
        "https://picsum.photos/seed/sonyxm6-2/800/800",
      ]),
      categoryId: allCategories[0].id,
      inventory: 150,
      salesCount: 678,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Nike Air Max 270 运动鞋",
      slug: "nike-air-max-270",
      description: "耐克经典气垫运动鞋，舒适缓震，百搭款。",
      price: 899,
      compareAtPrice: 1199,
      images: JSON.stringify([
        "https://picsum.photos/seed/nike270-1/800/800",
        "https://picsum.photos/seed/nike270-2/800/800",
      ]),
      categoryId: allCategories[3].id,
      inventory: 300,
      salesCount: 1024,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "良品铺子 每日坚果 750g",
      slug: "liangpin-daily-nuts",
      description: "精选7种坚果果干，科学配比，每日一袋，健康随行。",
      price: 89,
      compareAtPrice: 119,
      images: JSON.stringify([
        "https://picsum.photos/seed/nuts-1/800/800",
        "https://picsum.photos/seed/nuts-2/800/800",
      ]),
      categoryId: allCategories[4].id,
      inventory: 500,
      salesCount: 2048,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "佳能 EOS R6 Mark II",
      slug: "canon-eos-r6-mark2",
      description: "佳能全画幅微单相机，2420万像素，40fps连拍，4K 120p视频。",
      price: 15999,
      compareAtPrice: 17999,
      images: JSON.stringify([
        "https://picsum.photos/seed/canonr6-1/800/800",
        "https://picsum.photos/seed/canonr6-2/800/800",
      ]),
      categoryId: allCategories[0].id,
      inventory: 20,
      salesCount: 34,
      isActive: true,
      isFeatured: false,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log("✅ Products created:", products.length);

  // ======== 5. Create Banners ========
  const banners = [
    {
      title: "618 狂欢节",
      image: "https://picsum.photos/seed/banner618/1200/400",
      link: "/products",
      sortOrder: 1,
      isActive: true,
      position: "HOME",
    },
    {
      title: "新品首发 iPhone 16 Pro",
      image: "https://picsum.photos/seed/banner-iphone/1200/400",
      link: "/products/iphone-16-pro-max",
      sortOrder: 2,
      isActive: true,
      position: "HOME",
    },
    {
      title: "数码配件 全场5折",
      image: "https://picsum.photos/seed/banner-sale/1200/400",
      link: "/products?category=phone-digital",
      sortOrder: 3,
      isActive: true,
      position: "HOME",
    },
  ];

  for (const b of banners) {
    await prisma.banner.create({ data: b });
  }
  console.log("✅ Banners created:", banners.length);

  // ======== 6. Create Coupons ========
  const coupons = [
    {
      code: "WELCOME10",
      name: "新用户满减券",
      type: "FIXED",
      value: 10,
      minOrderAmount: 100,
      usageLimit: 100,
      usedCount: 0,
      isActive: true,
      validFrom: new Date("2025-01-01"),
      validUntil: new Date("2026-12-31"),
    },
    {
      code: "SAVE20",
      name: "满500减20",
      type: "FIXED",
      value: 20,
      minOrderAmount: 500,
      usageLimit: 50,
      usedCount: 0,
      isActive: true,
      validFrom: new Date("2025-01-01"),
      validUntil: new Date("2026-12-31"),
    },
    {
      code: "VIP9",
      name: "会员9折券",
      type: "PERCENT",
      value: 0.1,
      minOrderAmount: 200,
      usageLimit: 0, // unlimited
      usedCount: 0,
      isActive: true,
      validFrom: new Date("2025-01-01"),
      validUntil: new Date("2026-12-31"),
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.create({ data: c });
  }
  console.log("✅ Coupons created:", coupons.length);

  // ======== Summary ========
  console.log("\n🎉 Seed completed!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 Admin:    admin@minimall.com / admin123");
  console.log("📧 Customer: user@minimall.com  / user123");
  console.log("📦 Products:", products.length);
  console.log("📂 Categories:", categories.length);
  console.log("🎫 Coupons:", coupons.length);
  console.log("🖼️  Banners:", banners.length);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
