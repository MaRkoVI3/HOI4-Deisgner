import * as React from 'react';
import { cn } from './lib/utils';
import { X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info';
}

export function Alert({ className, variant = 'default', ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
        {
          'border-border bg-background text-foreground': variant === 'default',
          'border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive dark:bg-destructive/20': variant === 'destructive',
          'border-yellow-500/50 bg-yellow-500/10 text-yellow-900 dark:text-yellow-100': variant === 'warning',
          'border-green-500/50 bg-green-500/10 text-green-900 dark:text-green-100': variant === 'success',
          'border-blue-500/50 bg-blue-500/10 text-blue-900 dark:text-blue-100': variant === 'info',
        },
        className
      )}
      {...props}
    />
  );
}

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export function AlertTitle({ className, ...props }: AlertTitleProps) {
  return (
    <h5 className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />
  );
}

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
  );
}