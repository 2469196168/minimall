"use client";

import { Component, type ReactNode } from "react";

// ======== Props ========
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 通用 Error Boundary
 * 用法:
 *   <ErrorBoundary fallback={<p>自定义错误 UI</p>}>
 *     <MyComponent />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center px-4 py-16 text-center">
          <p className="text-5xl">😵</p>
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            页面出错了
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {process.env.NODE_ENV === "development"
              ? this.state.error?.message
              : "发生了未知错误，请稍后再试"}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
            }}
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            点击重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
