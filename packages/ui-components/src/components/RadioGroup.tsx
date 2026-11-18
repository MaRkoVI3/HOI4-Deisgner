// ============================================================================
// RadioGroup Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
}

export interface RadioGroupItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  value: string;
  label: string;
  description?: string;
}

const RadioGroupContext = React.createContext<{
  value: string | undefined;
  onValueChange: (value: string) => void;
  disabled: boolean;
  orientation: 'horizontal' | 'vertical';
} | null>(null);

function useRadioGroupContext() {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error('RadioGroup components must be used within a RadioGroup');
  }
  return context;
}

export function RadioGroup({
  value,
  onValueChange,
  children,
  className,
  orientation = 'vertical',
  disabled = false
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange: onValueChange || (() => {}), disabled, orientation }}>
      <div
        className={cn(
          'gap-4',
          orientation === 'horizontal' ? 'flex flex-wrap' : 'flex flex-col',
          className
        )}
        role="radiogroup"
        aria-orientation={orientation}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

RadioGroup.displayName = 'RadioGroup';

export function RadioGroupItem({
  className,
  value,
  label,
  description,
  disabled = false,
  ...props
}: RadioGroupItemProps) {
  const { value: currentValue, onValueChange, disabled: groupDisabled, orientation } = useRadioGroupContext();

  const isChecked = currentValue === value;
  const isDisabled = disabled || groupDisabled;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isChecked}
      aria-disabled={isDisabled}
      className={cn(
        'relative flex items-center gap-3',
        'rounded-lg border-2 p-3 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        isChecked
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 dark:bg-gray-800/50',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={() => !isDisabled && onValueChange(value)}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-5 w-5 items-center justify-center rounded-full border-2',
          'transition-colors',
          isChecked ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'
        )}
        aria-hidden="true"
      >
        {isChecked && (
          <div className="h-2.5 w-2.5 rounded-full bg-primary-500" />
        )}
      </div>
      <div className="text-sm leading-5">
        <span className={cn(
          'font-medium',
          isChecked ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300',
          isDisabled && 'text-gray-400 dark:text-gray-500'
        )}>
          {label}
        </span>
        {description && (
          <p className={cn(
            'text-xs mt-0.5',
            isChecked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
          )}>
            {description}
          </p>
        )}
      </div>
    </button>
  );
}

RadioGroupItem.displayName = 'RadioGroupItem';