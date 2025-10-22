"use client";

import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

/**
 * 简单的错误边界组件
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

/**
 * 默认错误回退组件
 */
function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <Card className="w-full max-w-md mx-auto my-8 border-destructive/50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-destructive">出现了错误</CardTitle>
        <CardDescription>
          {error?.message || "页面加载时发生了未知错误，请尝试刷新页面。"}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex gap-2 justify-center">
        <Button variant="outline" onClick={resetError} size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          重试
        </Button>
        <Button variant="secondary" onClick={() => window.location.reload()} size="sm">
          刷新页面
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * 列表专用错误边界 - 用于列表组件的错误处理
 */
export function ListErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">加载数据时出错</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {error?.message || "无法加载数据，请稍后重试"}
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={resetError}>
            <RefreshCw className="w-3 h-3 mr-1" />
            重试
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
