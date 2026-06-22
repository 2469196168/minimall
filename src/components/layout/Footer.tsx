import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              🛍️ Mini Mall
            </h3>
            <p className="text-sm text-gray-500">
              一个基于 Next.js 16 + Prisma + TailwindCSS 4 构建的微型电商项目，适合学习和快速开发。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">快速链接</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/products" className="hover:text-indigo-600">
                  全部商品
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-indigo-600">
                  购物车
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-indigo-600">
                  我的订单
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">联系我们</h3>
            <p className="text-sm text-gray-500">
              📧 support@minimall.com
              <br />
              📞 400-123-4567
              <br />
              🕐 周一至周日 9:00-18:00
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-4 text-center text-sm text-gray-400">
          © 2025 Mini Mall. Built with Next.js 16 + Prisma + TailwindCSS 4.
        </div>
      </div>
    </footer>
  );
}
