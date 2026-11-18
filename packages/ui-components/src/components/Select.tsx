// ============================================================================
// Select Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps<T extends string | number = string> extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption<T>[];
  placeholder?: string;
  multiple?: boolean;
}

export function Select<T extends string | number = string>({
  className,
  label,
  error,
  helperText,
  options,
  placeholder,
  multiple,
  id,
  ...props
}: SelectProps<T>) {
  const selectId = id || `select-${generateId()}`;
  const errorId = error ? `${selectId}-error` : undefined;
  const helperId = helperText ? `${selectId}-helper` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'block w-full rounded-lg border border-gray-300',
          'bg-white text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100',
          'dark:focus:ring-primary-400',
          error && 'border-red-500 focus:ring-red-500',
          'py-2.5 px-4 pr-10 text-sm appearance-none',
          'bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")]',
          'bg-[length:1.5rem_1.5rem] bg-[right_0.5rem_center] bg-no-repeat',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={cn(errorId, helperId)}
        multiple={multiple}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

Select.displayName = 'Select';

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}