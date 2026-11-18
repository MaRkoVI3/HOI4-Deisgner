// ============================================================================
// Checkbox Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${generateId()}`;

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={cn(
              'h-4 w-4 appearance-none rounded border border-gray-300',
              'bg-white checked:bg-primary-600 checked:border-primary-600',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-offset-gray-900',
              'transition-colors',
              className
            )}
            {...props}
          />
          <Check
            className={cn(
              'absolute h-3.5 w-3.5 text-white',
              'opacity-0 scale-50 transition-all duration-100',
              'checked:opacity-100 checked:scale-100',
              props.checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            )}
            strokeWidth={3}
            aria-hidden="true"
          />
        </div>
        <div className="text-sm leading-5">
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'font-medium text-gray-900 dark:text-gray-100',
                props.disabled && 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}