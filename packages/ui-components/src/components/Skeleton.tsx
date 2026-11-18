// ============================================================================
// Skeleton Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', width, height, lines = 1, ...props }, ref) => {
    const baseStyles = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

    const variantStyles = {
      text: 'h-4',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
      card: 'rounded-xl',
    };

    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(baseStyles, variantStyles.text)}
              style={{ width: i === lines - 1 ? '60%' : '100%' }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          className
        )}
        style={{ width, height }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showFooter?: boolean;
  lines?: number;
}

export function SkeletonCard({
  className,
  showImage = true,
  showTitle = true,
  showDescription = true,
  showFooter = false,
  lines = 3,
  ...props
}: SkeletonCardProps) {
  return (
    <div className={cn('rounded-xl border bg-white dark:bg-gray-800 p-4 space-y-4', className)} {...props}>
      {showImage && (
        <Skeleton variant="rectangular" height="120" width="100%" />
      )}
      <div className="space-y-3">
        {showTitle && <Skeleton variant="text" width="40%" />}
        {showDescription && <Skeleton variant="text" lines={lines} />}
        {showFooter && (
          <div className="flex gap-2 pt-2">
            <Skeleton variant="rectangular" width="80" height="32" />
            <Skeleton variant="rectangular" width="80" height="32" />
          </div>
        )}
      </div>
    </div>
  );
}

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function SkeletonTable({ rows = 5, columns = 4, showHeader = true }: SkeletonTableProps) {
  return (
    <div className="rounded-lg border bg-white dark:bg-gray-800 overflow-hidden">
      {showHeader && (
        <div className="border-b dark:border-gray-700 p-4">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} variant="text" width={`${100 / columns}%`} />
            ))}
          </div>
        </div>
      )}
      <div className="divide-y dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  variant="text"
                  width={`${100 / columns}%`}
                  className="h-5"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ items = 5, showAvatar = true, lines = 2 }: {
  items?: number;
  showAvatar?: boolean;
  lines?: number;
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {showAvatar && <Skeleton variant="circular" width="48" height="48" />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" lines={lines} />
          </div>
        </div>
      ))}
    </div>
  );
}