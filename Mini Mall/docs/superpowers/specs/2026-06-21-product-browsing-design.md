# Phase 2: 商品浏览 — 设计规格

> 日期: 2026-06-21 | 状态: 设计已批准

## 目标

实现商品列表页和商品详情页，用户可浏览、搜索、筛选、排序商品。

## 路由设计

| 路由 | 页面 | 数据获取 |
|------|------|---------|
| `/products` | 商品列表 | Server Component + URL searchParams |
| `/products/[slug]` | 商品详情 | Server Component + params.slug |

### 商品列表 URL 参数

```
/products?search=耳机&category=phone&sort=newest&page=1
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `search` | 关键词搜索 | — |
| `category` | 分类 slug 筛选 | — |
| `sort` | 排序方式 | `newest` |
| `page` | 页码 | `1` |

**排序选项：** `newest`（最新）、`price_asc`（价格↑）、`price_desc`（价格↓）、`sales`（销量）

每页 12 条商品。

## 视觉决策

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 商品列表布局 | 侧边栏筛选 | 左侧分类筛选 + 右侧商品网格 |
| 商品卡片风格 | 丰富风格 | 图片 + 名称 + 评分 + 划线价 + 售价 + 销量 + 收藏按钮 |
| 商品详情布局 | 左右分栏 | 左图集 + 右商品信息 |
| 分页方式 | 传统分页 | 底部页码导航 |
| 搜索方式 | 即时搜索 | 输入时自动筛选，防抖 300ms |

## 组件清单

### 新组件

| 组件 | 类型 | 文件路径 | 职责 |
|------|------|---------|------|
| `ProductCard` | Server | `src/components/product/ProductCard.tsx` | 商品卡片（丰富风格），接收 ProductCardData |
| `ProductGrid` | Server | `src/components/product/ProductGrid.tsx` | 商品网格容器，接收 products[] |
| `CategoryFilter` | Client | `src/components/product/CategoryFilter.tsx` | 侧边栏分类列表，当前高亮 |
| `ProductSearch` | Client | `src/components/product/ProductSearch.tsx` | 搜索输入框，防抖 300ms，URL 驱动 |
| `Pagination` | Client | `src/components/ui/Pagination.tsx` | 通用分页导航 |
| `StarRating` | Server | `src/components/ui/StarRating.tsx` | 星级评分展示 |

### 复用组件

- `Header` — 前台顶栏（已有）
- `Footer` — 前台底部（已有）

## 数据流

### 商品列表页

```
Server Component (page.tsx)
  ← URL searchParams { search, category, sort, page }
  → Prisma findMany({ where, orderBy, skip, take })
  → Prisma count({ where })
  → totalCount + products[]
  ├→ ProductSearch (Client) — 输入 → router.push(新URL)
  ├→ CategoryFilter (Client) — 点击 → router.push(新URL)
  ├→ ProductGrid (Server) — 渲染 ProductCard[]
  └→ Pagination (Client) — 点击 → router.push(新URL)
```

所有交互（搜索、筛选、排序、翻页）通过更新 URL searchParams 触发 Server Component 重新渲染。无需 API 中转。

### 商品详情页

```
Server Component (page.tsx)
  ← params.slug
  → Prisma findUnique({
      where: { slug },
      include: { category: true, reviews: { include: { user: ... } } }
    })
  ├→ 左栏: 图片展示（主图 + 缩略图，Client Component 切换）
  ├→ 右栏: 商品信息 + 数量选择 + 加购按钮（Client）
  └→ 下方: 商品描述 + 评价列表（Server）
```

## API 变更

本阶段不新增 API Route。商品数据通过 Server Component 直接读取 Prisma。

## 实现范围

### 增加的文件

```
src/app/(shop)/products/
  ├── page.tsx                    # 商品列表页
  └── [slug]/page.tsx             # 商品详情页
src/components/product/
  ├── ProductCard.tsx             # 商品卡片
  ├── ProductGrid.tsx             # 商品网格
  ├── CategoryFilter.tsx          # 分类侧边栏
  └── ProductSearch.tsx           # 搜索输入框
src/components/ui/
  ├── Pagination.tsx              # 分页导航
  └── StarRating.tsx              # 星级评分
```

### 修改的文件

```
src/app/(shop)/page.tsx           # 替换内联 ProductCard 为共用组件
```

### 本期不包含

- ❌ 价格区间筛选
- ❌ 加购/收藏交互逻辑（Phase 4）
- ❌ 评价发表功能（Phase 6）
- ❌ 移动端响应式适配（Phase 8）

## 验证标准

1. 访问 `/products` — 显示商品列表，侧边栏显示分类
2. 点击分类 — URL 更新为 `?category=xxx`，商品列表过滤
3. 输入搜索词 — 300ms 后自动搜索，URL 更新
4. 切换排序 — URL 更新，商品顺序改变
5. 翻页 — URL 更新为 `?page=N`，显示对应页数据
6. 点击商品 → 跳转 `/products/[slug]`，显示详情（左图右信息）
7. `npm run build` — 无 TypeScript 错误
