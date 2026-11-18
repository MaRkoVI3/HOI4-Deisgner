// ============================================================================
// ScrollArea Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal' | 'both';
  scrollbar?: 'auto' | 'always' | 'never' | 'hover';
}

const scrollbarStyles = {
  auto: '',
  always: 'scrollbar-always',
  never: 'scrollbar-none',
  hover: 'scrollbar-hover',
};

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, orientation = 'vertical', scrollbar = 'auto', children, ...props }, ref) => {
    const orientationStyles = {
      vertical: 'overflow-y-auto',
      horizontal: 'overflow-x-auto',
      both: 'overflow-auto',
    };

    return (
      <div
        ref={ref}
        className={cn(
          orientationStyles[orientation],
          scrollbarStyles[scrollbar],
          'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent',
          'dark:scrollbar-thumb-gray-600 dark:scrollbar-track-transparent',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';

export interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal';
  thumbClassName?: string;
  trackClassName?: string;
}

export const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ className, orientation = 'vertical', thumbClassName, trackClassName, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          orientation === 'vertical' ? 'w-2 h-full' : 'h-2 w-full',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'absolute rounded-full bg-gray-300 dark:bg-gray-600 transition-opacity',
            orientation === 'vertical' ? 'left-0.5 right-0.5' : 'top-0.5 bottom-0.5',
            trackClassName
          )}
        />
        <div
          className={cn(
            'absolute rounded-full bg-gray-400 dark:bg-gray-500',
            'hover:bg-gray-500 dark:hover:bg-gray-400',
            'active:bg-gray-600 dark:active:bg-gray-300',
            orientation === 'vertical' ? 'left-0.5 right-0.5' : 'top-0.5 bottom-0.5',
            thumbClassName
          )}
        />
        {children}
      </div>
    );
  }
);

ScrollBar.displayName = 'ScrollBar';