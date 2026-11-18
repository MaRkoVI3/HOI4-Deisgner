// ============================================================================
// Loading Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  color?: 'primary' | 'white' | 'gray';
  label?: string;
}

const sizeStyles = {
  spinner: { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' },
  dots: { sm: 'h-1.5 w-1.5', md: 'h-2.5 w-2.5', lg: 'h-3.5 w-3.5' },
  pulse: { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' },
  bars: { sm: 'h-4', md: 'h-6', lg: 'h-8' },
};

const colorStyles = {
  primary: 'text-primary-600',
  white: 'text-white',
  gray: 'text-gray-400',
};

export function Loading({
  className,
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  label,
  ...props
}: LoadingProps) {
  const renderSpinner = () => (
    <svg
      className={cn('animate-spin', sizeStyles.spinner[size], colorStyles[color])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const renderDots = () => (
    <div className={cn('flex gap-1', colorStyles[color])} aria-hidden="true">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-bounce',
            sizeStyles.dots[size]
          )}
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={cn(
        'rounded-full animate-pulse',
        sizeStyles.pulse[size],
        colorStyles[color].replace('text-', 'bg-').replace('primary-600', 'primary-200').replace('white', 'gray-200').replace('gray-400', 'gray-200')
      )}
      aria-hidden="true"
    />
  );

  const renderBars = () => (
    <div className={cn('flex gap-1 items-end', colorStyles[color])} aria-hidden="true">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className={cn(
            'rounded animate-[bar_1s_ease-in-out_infinite]',
            'w-1'
          )}
          style={{
            height: sizeStyles.bars[size],
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  );

  const renderers = {
    spinner: renderSpinner,
    dots: renderDots,
    pulse: renderPulse,
    bars: renderBars,
  };

  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-2', className)}
      {...props}
    >
      {renderers[variant]()}
      {label && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      )}
    </div>
  );
}

export interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingOverlay({ isLoading, children, label, size = 'md' }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 rounded-lg">
          <Loading size={size} label={label} />
        </div>
      )}
    </div>
  );
}

export function LoadingButton({
  isLoading,
  children,
  className,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean }) {
  return (
    <button
      className={cn('relative', className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2">
          <Loading size="sm" color="white" />
        </span>
      )}
      <span className={cn('relative flex items-center justify-center', isLoading && 'opacity-0')}>
        {children}
      </span>
    </button>
  );
}