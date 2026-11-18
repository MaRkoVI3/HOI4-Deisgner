// ============================================================================
// Container Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padded?: boolean;
}

const sizeStyles = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[90rem]',
  full: 'max-w-full',
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', padded = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto w-full',
          sizeStyles[size],
          padded && 'px-4 sm:px-6 lg:px-8',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'alternate' | 'bordered';
  padded?: boolean;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, variant = 'default', padded = true, children, ...props }, ref) => {
    const variantStyles = {
      default: '',
      alternate: 'bg-gray-50 dark:bg-gray-900/50',
      bordered: 'border-t dark:border-gray-700',
    };

    return (
      <section
        ref={ref}
        className={cn(
          'py-12 sm:py-16 lg:py-20',
          padded && 'px-4 sm:px-6 lg:px-8',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <Container>{children}</Container>
      </section>
    );
  }
);

Section.displayName = 'Section';

export interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const Page = React.forwardRef<HTMLDivElement, PageProps>(
  ({ className, title, description, action, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('min-h-screen bg-gray-50 dark:bg-gray-900', className)} {...props}>
        {(title || description || action) && (
          <header className="border-b dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
            <Container className="py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {title && (
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
                  )}
                  {description && (
                    <p className="mt-1 text-gray-500 dark:text-gray-400">{description}</p>
                  )}
                </div>
                {action && <div className="mt-4 sm:mt-0">{action}</div>}
              </div>
            </Container>
          </header>
        )}
        <main className="py-6 sm:py-8">
          <Container>{children}</Container>
        </main>
      </div>
    );
  }
);

Page.displayName = 'Page';