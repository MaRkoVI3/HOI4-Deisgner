import * as React from 'react';
import { cn } from './lib/utils';
import { Check } from 'lucide-react';

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative flex items-center">
      <input
        type="checkbox"
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
          className
        )}
        ref={ref}
        {...props}
      />
      <span className={cn('absolute text-primary opacity-0 transition-opacity', 'peer-data-[state=checked]:opacity-100')}>
        <Check className="h-3.5 w-3.5" />
      </span>
    </div>
  )
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };