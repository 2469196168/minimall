# Mini Mall — 微型电商项目

> 基于 Next.js 16 + Prisma 5 + SQLite + TailwindCSS 4 的全栈电商项目，适合学习和快速开发。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.2.9 | React 全栈框架，App Router + Turbopack |
| React | 19.2.4 | UI 库，Server Components + Server Actions |
| TypeScript | 5.x | 类型安全 |
| Prisma | 5.22.0 | ORM，数据库迁移与查询 |
| SQLite | (Prisma) | 零配置开发数据库 |
| TailwindCSS | 4.x | CSS-first 原子化样式 |
| Zod | 4.4.3 | 输入校验 |
| bcryptjs | 3.0.3 | 密码哈希 |
| jose | 6.2.3 | JWT 签发与验证 |
| tsx | 4.22.4 | TypeScript 脚本运行（种子数据） |

## 项目结构

```
src/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # 根布局
│   ├── globals.css              # Tailwind 4 + 全局样式
│   ├── (shop)/                  # 🛒 前台路由组
│   │   ├── layout.tsx           # Header + Footer 布局
│   │   └── page.tsx             # 首页（轮播+精选+热销）
│   ├── (auth)/                  # 🔐 认证路由组
│   │   └── layout.tsx           # 居中卡片布局
│   └── admin/                   # ⚙️ 后台路由组
│       └── layout.tsx           # 侧边栏 + 顶栏布局
├── components/
│   ├── layout/                  # 布局组件
│   │   ├── Header.tsx           # 前台顶栏
│   │   ├── Footer.tsx           # 前台底部
│   │   ├── AdminSidebar.tsx     # 后台侧边栏
│   │   └── AdminHeader.tsx      # 后台顶栏
│   └── ui/                      # 基础 UI 组件（待创建）
├── lib/
│   ├── prisma.ts                # Prisma 客户端单例
│   ├── auth.ts                  # JWT 工具：sign/verify/getCurrentUser
│   ├── utils.ts                 # formatPrice, slugify, cn, generateOrderNo, calcDiscount
│   └── validations.ts           # Zod Schema：注册/登录/商品/分类/地址/评价/优惠券/订单
├── types/
│   └── index.ts                 # TypeScript 类型定义
└── hooks/                       # 自定义 Hook（待创建）
prisma/
├── schema.prisma               # 12 个 Model 定义
├── migrations/                  # SQLite 迁移文件
└── seed.ts                      # 种子数据（管理员+用户+10商品+5分类+3轮播+3优惠券）
storage/
└── mini-mall.db                 # SQLite 数据库文件（gitignore）
public/
└── uploads/                     # 上传图片目录
```

## 数据库模型（12 个）

| 模型 | 说明 | 关键字段 |
|------|------|---------|
| `User` | 用户 | email, passwordHash, role(CUSTOMER/ADMIN) |
| `Category` | 商品分类 | name, slug, icon, sortOrder |
| `Product` | 商品 | name, slug, price, compareAtPrice, images(JSON), inventory, isFeatured |
| `CartItem` | 购物车 | userId+productId 唯一约束 |
| `WishlistItem` | 收藏 | userId+productId 唯一约束，toggle 模式 |
| `Review` | 评价 | rating(1-5), content, images(JSON)，仅已购用户可评 |
| `Address` | 收货地址 | 省/市/区/详细地址，isDefault |
| `Order` | 订单 | orderNo, status, addressSnapshot(JSON 快照), couponId, discount |
| `OrderItem` | 订单明细 | price 快照（防止商品变价） |
| `Coupon` | 优惠券 | code, type(FIXED/PERCENT), value, usageLimit, validUntil |
| `Banner` | 轮播图 | image, link, sortOrder, position |

## 开发命令

```bash
npm run dev          # 启动开发服务器 (Turbopack)
npm run build        # 生产构建
npm run start        # 启动生产服务器
npm run lint         # ESLint 检查
npm run db:generate  # 生成 Prisma Client
npm run db:push      # 同步 Schema 到数据库（不建迁移文件）
npm run db:seed      # 运行种子数据
npm run db:studio    # 打开 Prisma Studio 管理界面
```

### 种子账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@minimall.com | admin123 |
| 普通用户 | user@minimall.com | user123 |

## 核心约定

### 数据获取策略

- **Server Components 直接调用 Prisma** 读取数据（商品列表、详情、首页），无需 API 中转
- **Client Components 通过 API Route** 执行写操作（加购、下单、评价）
- **Server Actions** 可用于需要事务保证的操作

### 认证架构

- JWT + httpOnly Cookie 方案，不依赖第三方认证库
- `src/lib/auth.ts` 提供 `signToken()`, `verifyToken()`, `getCurrentUser()`, `setTokenCookie()`, `removeTokenCookie()`
- `proxy.ts` 保护 `/admin/*`、`/profile`、`/cart` 等路由，管理 API 鉴权
- 登录/注册 API 含 IP 频率限制（内存级，生产建议换 Redis）
- 密码使用 bcryptjs，salt rounds = 12

### 类型与校验

- `src/types/index.ts` — 共享类型（ApiResponse, PaginatedResponse, SafeUser, ProductCardData 等）
- `src/lib/validations.ts` — 所有 Zod Schema（auth, product, address, review, coupon, order, banner）
- 所有 API 输入必须用 Zod 校验

### SQLite 注意事项

- 不支持数组 → `Product.images` 存 JSON 字符串，读写时手动 parse/stringify
- 不支持 Decimal → 价格用 Float，前端展示用 `formatPrice()` 格式化为 ¥x.xx
- 不支持 enum → 用 String + Zod 校验
- 主键用 CUID（非连续、不可预测），不用自增 ID

### 订单设计要点

- `Order.orderNo`：业务订单号 `yyyyMMddHHmmss-随机4位`
- `OrderItem.price`：下单时商品价格快照，防止后续变价
- `Order.addressSnapshot`：下单时地址 JSON 快照，防止用户删地址
- 订单状态流转：`PENDING → PAID → SHIPPED → DELIVERED`（可 `→ CANCELLED`）
- 模拟支付：用户点击"支付"按钮调用 PATCH API，直接改状态

### 路由组设计

- `(shop)/` — 前台商城，共用 Header + Footer 布局
- `(auth)/` — 登录/注册，居中简洁布局
- `admin/` — 后台管理，侧边栏 + 顶栏布局
- 路由组不影响 URL 路径（`(shop)/products` → `/products`）

## Next.js 16 注意事项

- **Turbopack 是默认打包器**（dev + build），5-10x 更快
- **Sync APIs 已废弃** — `params`, `searchParams`, `cookies()`, `headers()` 必须 await
- **React Compiler 可选** — 通过 `reactCompiler: true` 启用自动 memoization
- **middleware.ts 已重命名为 `proxy.ts`**（但 middleware.ts 仍兼容）
- **Node.js ≥ 20.9.0 必需**，TypeScript ≥ 5.1.0

## 待实现功能

- [x] 商品列表/详情页
- [x] 用户注册/登录
- [ ] 购物车
- [ ] 下单结算
- [ ] 订单管理
- [ ] 商品评价
- [ ] 收藏/心愿单
- [ ] 收货地址管理
- [ ] 优惠券系统
- [ ] Admin 后台管理
- [x] proxy 路由守卫
