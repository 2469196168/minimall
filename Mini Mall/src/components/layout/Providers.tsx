"use client";

import { AuthProvider } from "@/hooks/useAuth";
import type { ReactNode } from "react";

/**
 * 客户端 Provider 包装器
 * 在根布局中引入所有 Client Context
 */
export default function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
