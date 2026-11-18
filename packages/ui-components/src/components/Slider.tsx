// ============================================================================
// Slider Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface SliderProps {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number | number[];
  onValueChange?: (value: number | number[]) => void;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      label,
      min = 0,
      max = 100,
      step = 1,
      value = [0],
      onValueChange,
      orientation = 'horizontal',
      disabled = false,
      id,
      ...props
    },
    ref
  ) => {
    const sliderId = id || `slider-${generateId()}`;
    const values = Array.isArray(value) ? value : [value];

    const handleChange = (index: number, newValue: number) => {
      const newValues = [...values];
      newValues[index] = Math.max(min, Math.min(max, Math.round(newValue / step) * step));
      onValueChange?.(newValues);
    };

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label htmlFor={sliderId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
            <span className="text-gray-500 dark:text-gray-400 ml-1">
              {values.map((v, i) => `${i > 0 ? ' - ' : ''}${v}`).join('')}
            </span>
          </label>
        )}
        <div className="relative" role="slider" aria-orientation={orientation}>
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className="absolute h-full bg-primary-600 rounded-full"
              style={{
                left: `${((values[0] - min) / (max - min)) * 100}%`,
                width: `${values.length > 1 ? (((values[1] - values[0]) / (max - min)) * 100) : 0}%`,
              }}
            />
          </div>
          {values.map((val, index) => (
            <input
              key={index}
              ref={index === 0 ? ref : undefined}
              type="range"
              min={min}
              max={max}
              step={step}
              value={val}
              onChange={(e) => handleChange(index, Number(e.target.value))}
              disabled={disabled}
              className="absolute -top-1.5 h-5 w-5 appearance-none cursor-pointer opacity-0 focus:opacity-100"
              style={{
                left: `${((val - min) / (max - min)) * 100}%`,
                transform: 'translateX(-50%)',
              }}
              aria-label={label}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={val}
              {...props}
            />
          ))}
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}