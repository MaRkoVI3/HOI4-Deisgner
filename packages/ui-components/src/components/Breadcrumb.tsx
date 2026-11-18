// ============================================================================
// Breadcrumb Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
  }>;
  separator?: React.ReactNode;
  className?: string;
}

export function Breadcrumb({
  items,
  separator = <ChevronRight className="h-4 w-4" aria-hidden="true" />,
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      className={cn('flex items-center gap-1.5', className)}
      aria-label="Breadcrumb"
      {...props}
    >
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="text-gray-400 dark:text-gray-500" aria-hidden="true">
                {separator}
              </span>
            )}
            {item.href || item.onClick ? (
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  item.onClick?.();
                }}
                className={cn(
                  'text-sm font-medium transition-colors',
                  item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
                )}
                aria-current={index === items.length - 1 ? 'page' : undefined}
                aria-disabled={item.disabled}
              >
                {index === 0 && !item.href && !item.onClick ? (
                  <Home className="h-4 w-4 inline" aria-hidden="true" />
                ) : (
                  item.label
                )}
              </a>
            ) : (
              <span
                className={cn(
                  'text-sm font-medium',
                  index === items.length - 1
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400'
                )}
                aria-current={index === items.length - 1 ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export interface BreadcrumbItemProps {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function BreadcrumbItem({ label, href, onClick, disabled = false }: BreadcrumbItemProps) {
  return (
    <li className="flex items-center gap-1.5">
      {href || onClick ? (
        <a
          href={href}
          onClick={(e) => {
            e.preventDefault();
            onClick?.();
          }}
          className={cn(
            'text-sm font-medium transition-colors',
            disabled
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
          )}
          aria-disabled={disabled}
        >
          {label}
        </a>
      ) : (
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </span>
      )}
    </li>
  );
}

export interface BreadcrumbSeparatorProps {
  children?: React.ReactNode;
  className?: string;
}

export function BreadcrumbSeparator({ children = <ChevronRight className="h-4 w-4" />, className }: BreadcrumbSeparatorProps) {
  return (
    <li className={cn('text-gray-400 dark:text-gray-500', className)} aria-hidden="true">
      {children}
    </li>
  );
}

export interface BreadcrumbPageProps {
  label: string;
  className?: string;
}

export function BreadcrumbPage({ label, className }: BreadcrumbPageProps) {
  return (
    <li className={cn('text-sm font-medium text-gray-900 dark:text-gray-100', className)} aria-current="page">
      {label}
    </li>
  );
}