import * as React from 'react';
import { cn } from './lib/utils';
import { Circle } from 'lucide-react';

const RadioGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: string; onValueChange?: (value: string) => void }>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('grid gap-2', className)} {...props}>
      {children}
    </div>
  )
);
RadioGroup.displayName = 'RadioGroup';

const RadioGroupItem = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { value: string }>(
  ({ className, value, ...props }, ref) => (
    <div className="relative flex items-center gap-2">
      <input
        type="radio"
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        value={value}
        ref={ref}
        {...props}
      />
      <span className={cn('absolute text-primary opacity-0 transition-opacity', 'peer-checked:opacity-100')}>
        <Circle className="h-2.5 w-2.5 fill-current" />
      </span>
    </div>
  )
);
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };