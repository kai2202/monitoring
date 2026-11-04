import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FontAwesomeIcon, faTriangleExclamation, faRotate } from '../icons';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Frontend/src/shared/feedback/ErrorBoundary.tsx
 *
 * Chặn lỗi Runtime React unhandled, ngăn chặn sập giao diện và màn hình đen.
 * 100% FontAwesome Icons (AGENTS.md Rule 7.1).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Phát hiện lỗi Runtime:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-foreground my-4 max-w-xl mx-auto shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-rose-600 dark:text-rose-400">
            <FontAwesomeIcon icon={faTriangleExclamation} size="lg" />
            <h2 className="text-base font-bold">
              {this.props.fallbackTitle || 'Đã xảy ra sự cố giao diện'}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Hệ thống đã tự động cách ly vùng lỗi để bảo vệ toàn vẹn dữ liệu.
            {this.state.error?.message && (
              <span className="block font-mono bg-rose-100/50 dark:bg-rose-900/40 p-2 rounded-lg mt-2 text-rose-800 dark:text-rose-300">
                {this.state.error.message}
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
          >
            <FontAwesomeIcon icon={faRotate} size="xs" />
            <span>Thử tải lại thành phần</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
