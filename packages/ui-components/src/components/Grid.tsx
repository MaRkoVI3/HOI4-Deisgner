// ============================================================================
// Grid Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | { base: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rows?: number;
  autoFlow?: 'row' | 'col' | 'dense' | 'row-dense' | 'col-dense';
}

const gapStyles = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

function getColsClass(cols: GridProps['cols']): string {
  if (typeof cols === 'number') {
    return `grid-cols-${cols}`;
  }
  if (!cols) return 'grid-cols-1';

  const parts = [`grid-cols-${cols.base}`];
  if (cols.sm) parts.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md) parts.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) parts.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) parts.push(`xl:grid-cols-${cols.xl}`);
  return parts.join(' ');
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = 'md', rows, autoFlow, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          getColsClass(cols),
          gapStyles[gap],
          rows && `grid-rows-${rows}`,
          autoFlow && `grid-flow-${autoFlow}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colStart?: number;
  colEnd?: number;
  rowStart?: number;
  rowEnd?: number;
  colSpan?: number;
  rowSpan?: number;
}

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colStart, colEnd, rowStart, rowEnd, colSpan, rowSpan, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          colStart && `col-start-${colStart}`,
          colEnd && `col-end-${colEnd}`,
          rowStart && `row-start-${rowStart}`,
          rowEnd && `row-end-${rowEnd}`,
          colSpan && `col-span-${colSpan}`,
          rowSpan && `row-span-${rowSpan}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GridItem.displayName = 'GridItem';

// Responsive grid helpers
export const GridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
  12: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
} as const;

export const GridGap = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
} as const;