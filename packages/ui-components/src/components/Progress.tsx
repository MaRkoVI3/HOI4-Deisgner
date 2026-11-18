// ============================================================================
// Progress Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showLabel = false, label, ...props }, ref) => {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));

    return (
      <div
        ref={ref}
        className={cn('relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700', className)}
        {...props}
      >
        <div
          className="h-full bg-primary-600 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
        {showLabel && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export interface CircularProgressProps extends React.SVGAttributes<SVGSVGElement> {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
  ({ className, value = 0, max = 100, size = 48, strokeWidth = 4, showLabel = false, children, ...props }, ref) => {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - percentage / 100);

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        className={cn('transform -rotate-90', className)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-primary-600 transition-all duration-300 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {showLabel && (
          <text
            x={size / 2}
            y={size / 2 + 4}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs font-medium fill-current"
          >
            {Math.round(percentage)}%
          </text>
        )}
        {children}
      </svg>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';