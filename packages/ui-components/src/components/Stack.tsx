// ============================================================================
// Stack Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'vertical' | 'horizontal';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  divider?: React.ReactNode;
  reverse?: boolean;
}

const gapStyles = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

function getGapClass(gap: StackProps['gap']): string {
  if (typeof gap === 'number') return `gap-[${gap}px]`;
  if (!gap) return 'gap-0';
  return gapStyles[gap];
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({
    className,
    direction = 'vertical',
    gap = 'md',
    align = 'stretch',
    divider,
    reverse = false,
    children,
    ...props
  }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const validChildren = childrenArray.filter(React.isValidElement);

    const childrenWithDividers = divider && validChildren.length > 1
      ? validChildren.flatMap((child, index) => [
          child,
          index < validChildren.length - 1 && (
            <div key={`divider-${index}`} className={cn('flex-shrink-0', direction === 'vertical' ? 'w-full' : 'h-full')}>
              {divider}
            </div>
          ),
        ]).filter(Boolean)
      : validChildren;

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          direction === 'vertical' ? 'flex-col' : 'flex-row',
          reverse && 'flex-col-reverse',
          getGapClass(gap),
          align !== 'stretch' && `items-${align}`,
          className
        )}
        {...props}
      >
        {childrenWithDividers}
      </div>
    );
  }
);

Stack.displayName = 'Stack';

// Vertical stack shorthand
export const VStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  ({ className, ...props }, ref) => (
    <Stack ref={ref} direction="vertical" className={className} {...props} />
  )
);

VStack.displayName = 'VStack';

// Horizontal stack shorthand
export const HStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  ({ className, ...props }, ref) => (
    <Stack ref={ref} direction="horizontal" className={className} {...props} />
  )
);

HStack.displayName = 'HStack';

// Divider component for stacks
export interface StackDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

export function StackDivider({
  className,
  orientation = 'horizontal',
  label,
  ...props
}: StackDividerProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2',
        orientation === 'horizontal' ? 'w-full' : 'h-full',
        className
      )}
      {...props}
    >
      <div className={cn(
        'flex-1 border-t',
        orientation === 'vertical' && 'border-t-0 border-l',
        'border-gray-200 dark:border-gray-700'
      )} />
      {label && (
        <span className="flex-shrink-0 px-2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {label}
        </span>
      )}
      <div className={cn(
        'flex-1 border-t',
        orientation === 'vertical' && 'border-t-0 border-l',
        'border-gray-200 dark:border-gray-700'
      )} />
    </div>
  );
}