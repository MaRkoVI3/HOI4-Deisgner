// ============================================================================
// Flex Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | number;
  fullWidth?: boolean;
  fullHeight?: boolean;
}

const directionStyles = {
  row: 'flex-row',
  col: 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'col-reverse': 'flex-col-reverse',
};

const wrapStyles = {
  wrap: 'flex-wrap',
  nowrap: 'flex-nowrap',
  'wrap-reverse': 'flex-wrap-reverse',
};

const justifyStyles = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const alignStyles = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

function getGapClass(gap: FlexProps['gap']): string {
  if (typeof gap === 'number') return `gap-[${gap}px]`;
  if (!gap) return '';
  return `gap-${gap}`;
}

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      className,
      direction = 'row',
      wrap = 'wrap',
      justify = 'start',
      align = 'stretch',
      gap = 'md',
      fullWidth = false,
      fullHeight = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionStyles[direction],
          wrapStyles[wrap],
          justifyStyles[justify],
          alignStyles[align],
          getGapClass(gap),
          fullWidth && 'w-full',
          fullHeight && 'h-full',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';

export interface FlexItemProps extends React.HTMLAttributes<HTMLDivElement> {
  grow?: number;
  shrink?: number;
  basis?: string | number;
  order?: number;
  alignSelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch' | 'baseline';
}

export const FlexItem = React.forwardRef<HTMLDivElement, FlexItemProps>(
  ({ className, grow, shrink, basis, order, alignSelf, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          grow !== undefined && `grow-${grow}`,
          shrink !== undefined && `shrink-${shrink}`,
          basis !== undefined && `basis-[${typeof basis === 'number' ? `${basis}px` : basis}]`,
          order !== undefined && `order-${order}`,
          alignSelf && `self-${alignSelf}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FlexItem.displayName = 'FlexItem';

// Inline flex variant
export const InlineFlex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, ...props }, ref) => (
    <Flex ref={ref} className={cn('inline-flex', className)} {...props} />
  )
);

InlineFlex.displayName = 'InlineFlex';