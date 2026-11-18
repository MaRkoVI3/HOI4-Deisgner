// ============================================================================
// Switch Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const switchId = id || `switch-${generateId()}`;

    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            role="switch"
            className={cn(
              'peer h-6 w-11 appearance-none rounded-full border border-gray-300',
              'bg-gray-200 checked:bg-primary-600 checked:border-primary-600',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-900',
              'transition-colors',
              className
            )}
            {...props}
          />
          <span
            className={cn(
              'pointer-events-none absolute top-0.5 left-0.5 block h-5 w-5 rounded-full bg-white',
              'shadow-lg transform transition-transform duration-200',
              'peer-checked:translate-x-full',
              'dark:bg-gray-300'
            )}
            aria-hidden="true"
          />
        </div>
        <div className="text-sm leading-5">
          {label && (
            <label
              htmlFor={switchId}
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

Switch.displayName = 'Switch';

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}