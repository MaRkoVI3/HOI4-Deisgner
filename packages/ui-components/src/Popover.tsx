import * as React from 'react';
import { cn } from './lib/utils';

const Popover: React.FC<{ children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }> = ({ children }) => <>{children}</>;

const PopoverTrigger: React.FC<React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }> = ({ asChild, children, ...props }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, props);
  }
  return <div {...props}>{children}</div>;
};

const PopoverContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div
    className={cn(
      'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export { Popover, PopoverTrigger, PopoverContent };