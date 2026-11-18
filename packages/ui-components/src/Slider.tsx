import * as React from 'react';
import { cn } from './lib/utils';

interface SliderProps {
  value?: number;
  onValueChange?: (value: number) => void;
  max?: number;
  min?: number;
  step?: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, max = 100, min = 0, step = 1, orientation = 'horizontal', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onValueChange?.(newValue);
    };

    return (
      <input
        type="range"
        ref={ref}
        className={cn(
          'relative h-2 w-full grow overflow-hidden rounded-full bg-secondary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary',
          orientation === 'vertical' && 'h-full w-2',
          className
        )}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };