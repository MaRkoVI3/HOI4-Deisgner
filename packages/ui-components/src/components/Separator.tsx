// ============================================================================
// Separator Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-200 dark:bg-gray-700',
          orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
          className
        )}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';