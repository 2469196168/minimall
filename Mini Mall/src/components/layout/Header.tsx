import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-indigo-600">
          🛍️ Mini Mall
        </Link>

        {/* Search */}
        <div className="hidden flex-1 px-8 md:block">
          <form action="/products" method="GET" className="relative">
            <input
              type="text"
              name="search"
              placeholder="搜索商品..."
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
            >
              🔍
            </button>
          </form>
        </div>

        {/* Right nav */}
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/products" className="text-gray-600 hover:text-indigo-600">
            全部商品
          </Link>
          <Link href="/wishlist" className="text-gray-600 hover:text-red-500">
            ♡ 收藏
          </Link>
          <Link
            href="/cart"
            className="relative text-gray-600 hover:text-indigo-600"
          >
            🛒 购物车
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-white hover:bg-indigo-700"
          >
            登录
          </Link>
        </nav>
      </div>
    </header>
  );
}
