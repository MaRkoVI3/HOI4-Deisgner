// ============================================================================
// StatCard Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string | number;
  icon?: React.ReactNode;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const colorStyles = {
  default: 'text-gray-900 dark:text-gray-100',
  primary: 'text-primary-600 dark:text-primary-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  danger: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
};

const sizeStyles = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const valueSizeStyles = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
};

const labelSizeStyles = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      label,
      value,
      unit,
      trend,
      trendValue,
      icon,
      color = 'default',
      size = 'md',
      className,
      children,
    },
    ref
  ) => {
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400';

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
          'shadow-sm hover:shadow-md transition-shadow',
          sizeStyles[size],
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className={cn(labelSizeStyles[size], 'font-medium text-gray-500 dark:text-gray-400')}>
              {label}
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className={cn(valueSizeStyles[size], 'font-bold', colorStyles[color])}>
                {value}
              </span>
              {unit && (
                <span className={cn(labelSizeStyles[size], 'text-gray-500 dark:text-gray-400')}>
                  {unit}
                </span>
              )}
            </div>
          </div>
          {icon && (
            <div className={cn('p-2 rounded-lg', color === 'default' ? 'bg-gray-100 dark:bg-gray-700' : '')}>
              {icon}
            </div>
          )}
        </div>
        {children && (
          <div className="mt-2">
            {children}
          </div>
        )}
        {(trend || trendValue !== undefined) && (
          <div className="mt-3 flex items-center gap-1">
            <TrendIcon className={cn('h-4 w-4', trendColor)} aria-hidden="true" />
            {trendValue && (
              <span className={cn('text-sm font-medium', trendColor)}>
                {trendValue}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';

export interface StatRowProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  tooltip?: string;
  lowerIsBetter?: boolean;
  className?: string;
}

export const StatRow = React.forwardRef<HTMLDivElement, StatRowProps>(
  ({ label, value, unit, color = 'default', tooltip, className }, ref) => {
    const colorStylesRow = {
      default: 'text-gray-900 dark:text-gray-100',
      primary: 'text-primary-600 dark:text-primary-400',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      danger: 'text-red-600 dark:text-red-400',
      info: 'text-blue-600 dark:text-blue-400',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between gap-4 py-2 px-3',
          'rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50',
          className
        )}
        title={tooltip}
      >
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className={cn('text-lg font-semibold', colorStylesRow[color])}>
            {value}
          </span>
          {unit && (
            <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>
          )}
        </div>
      </div>
    );
  }
);

StatRow.displayName = 'StatRow';