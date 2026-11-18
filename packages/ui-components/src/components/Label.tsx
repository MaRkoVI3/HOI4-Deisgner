// ============================================================================
// Label Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required = false, size = 'md', children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block font-medium text-gray-700 dark:text-gray-300',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';