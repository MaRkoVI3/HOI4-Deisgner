// ============================================================================
// Alert Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  title?: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700',
  destructive: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800',
  success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800',
  info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800',
};

const variantIcons = {
  default: AlertCircle,
  destructive: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantIconColors = {
  default: 'text-gray-500',
  destructive: 'text-red-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'default',
      title,
      description,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    const Icon = variantIcons[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-lg border p-4',
          variantStyles[variant],
          className
        )}
        role="alert"
        {...props}
      >
        <div className="flex gap-3">
          <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', variantIconColors[variant])} aria-hidden="true" />
          <div className="flex-1">
            {title && (
              <h4 className="font-medium">{title}</h4>
            )}
            {description && (
              <p className="mt-1 text-sm opacity-90">{description}</p>
            )}
            {children && (
              <div className="mt-2 text-sm opacity-90">{children}</div>
            )}
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={onDismiss}
              className={cn(
                'shrink-0 rounded p-1 opacity-50 hover:opacity-100',
                'focus:outline-none focus:ring-2 focus:ring-offset-2'
              )}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';