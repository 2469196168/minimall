"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatPrice, safeParseImages } from "@/lib/utils";

// ======== Types ========
interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

interface CouponResult {
  id: string;
  code: string;
  name: string;
  type: string;
  value: number;
  discount: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, loading: cartLoading, totalAmount } = useCart();

  // 地址
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // 优惠券
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // 备注
  const [note, setNote] = useState("");

  // 下单
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 加载地址
  useEffect(() => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAddresses(d.data);
          const defaultAddr = d.data.find((a: Address) => a.isDefault) || d.data[0];
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        }
      })
      .finally(() => setLoadingAddresses(false));
  }, []);

  // 当订单金额变化时清除优惠券（防止金额变化后仍用旧优惠券）
  useEffect(() => {
    setCouponResult(null);
    setCouponError("");
    setCouponCode("");
  }, [totalAmount]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    setValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), orderAmount: totalAmount }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponResult(data.data);
      } else {
        setCouponError(data.error || "优惠券无效");
        setCouponResult(null);
      }
    } catch {
      setCouponError("网络错误");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponResult(null);
    setCouponCode("");
  };

  // 应付金额
  const finalTotal = couponResult
    ? Math.max(0, totalAmount - couponResult.discount)
    : totalAmount;

  const handleSubmit = async () => {
    if (!selectedAddressId) {
      setError("请选择收货地址");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddressId,
          couponId: couponResult?.id || undefined,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/orders/${data.data.id}`);
      } else {
        setError(data.error || "下单失败");
      }
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  };

  // 加载中
  if (cartLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </div>
    );
  }

  // 购物车为空 → 重定向
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-6xl">📋</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">购物车是空的</h1>
        <p className="mt-2 text-sm text-gray-500">先添加商品再来结算吧</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white"
        >
          去逛逛
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">确认订单</h1>

      {/* ======== 收货地址 ======== */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-gray-700">收货地址</h2>
        {loadingAddresses ? (
          <div className="mt-2 animate-pulse text-sm text-gray-400">加载地址...</div>
        ) : addresses.length === 0 ? (
          <div className="mt-2 rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
            暂无收货地址，
            <Link href="/profile/addresses" className="text-indigo-600 hover:underline">
              去添加
            </Link>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  selectedAddressId === addr.id
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={addr.id}
                  checked={selectedAddressId === addr.id}
                  onChange={() => setSelectedAddressId(addr.id)}
                  className="mt-1 accent-indigo-600"
                />
                <div className="flex-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{addr.name}</span>
                    <span className="text-gray-500">{addr.phone}</span>
                    {addr.isDefault && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600">
                        默认
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-gray-500">
                    {addr.province} {addr.city} {addr.district} {addr.detail}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* ======== 商品明细 ======== */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-gray-700">商品明细</h2>
        <div className="mt-2 divide-y rounded-lg border border-gray-200">
          {items.map((item) => {
            const images = safeParseImages(item.product.images);
            const image = images[0] || "https://picsum.photos/100/100";
            return (
              <div key={item.id} className="flex items-center gap-3 p-3">
                <img
                  src={image}
                  alt={item.product.name}
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500">x{item.quantity}</p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======== 优惠券 ======== */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-gray-700">优惠券</h2>
        <div className="mt-2">
          {couponResult ? (
            <div className="flex items-center justify-between rounded-lg border border-green-300 bg-green-50 p-3">
              <div>
                <p className="text-sm font-medium text-green-700">{couponResult.name}</p>
                <p className="text-xs text-green-600">优惠码：{couponResult.code}</p>
                <p className="text-xs text-green-600">
                  抵扣：{formatPrice(couponResult.discount)}
                </p>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-xs text-red-500 hover:text-red-700"
              >
                移除
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                placeholder="输入优惠码"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || validatingCoupon}
                className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {validatingCoupon ? "校验中..." : "使用"}
              </button>
            </div>
          )}
          {couponError && (
            <p className="mt-1 text-xs text-red-500">{couponError}</p>
          )}
        </div>
      </section>

      {/* ======== 备注 ======== */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-gray-700">订单备注</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
          placeholder="选填：给卖家的留言（最多200字）"
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          rows={2}
        />
      </section>

      {/* ======== 金额汇总 ======== */}
      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>商品合计</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>运费</span>
            <span className="text-green-600">免运费</span>
          </div>
          {couponResult && (
            <div className="flex justify-between text-green-600">
              <span>优惠券抵扣</span>
              <span>-{formatPrice(couponResult.discount)}</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex justify-between border-t border-gray-100 pt-3">
          <span className="text-lg font-bold text-gray-900">应付总额</span>
          <span className="text-xl font-bold text-red-600">{formatPrice(finalTotal)}</span>
        </div>
      </section>

      {/* 错误提示 */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={submitting || items.length === 0}
        className="mt-6 w-full rounded-lg bg-red-600 py-3.5 text-center text-base font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "提交中..." : `提交订单 ${formatPrice(finalTotal)}`}
      </button>

      <div className="mt-4">
        <Link href="/cart" className="text-sm text-gray-500 hover:text-indigo-600">
          ← 返回购物车
        </Link>
      </div>
    </div>
  );
}
