import * as React from 'react';
import { cn } from './lib/utils';
import { Check, ChevronRight, Circle } from 'lucide-react';

const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const DropdownMenuTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, children, ...props }) => (
  <button className={cn('flex h-10 w-full items-center justify-center rounded-md bg-background px-3 py-2 text-sm font-medium', className)} {...props}>
    {children}
  </button>
);

const DropdownMenuContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const DropdownMenuItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }> = ({ className, inset, children, ...props }) => (
  <div
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const DropdownMenuCheckboxItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { checked?: boolean }> = ({ className, checked, children, ...props }) => (
  <DropdownMenuItem className={cn('relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground', className)} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Circle className="h-2 w-2 fill-current text-current" />
      {checked && <Check className="h-4 w-4" />}
    </span>
    {children}
  </DropdownMenuItem>
);

const DropdownMenuRadioItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { checked?: boolean }> = ({ className, checked, children, ...props }) => (
  <DropdownMenuItem className={cn('relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground', className)} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Circle className="h-2 w-2 fill-current text-current" />
      {checked && <Circle className="h-2.5 w-2.5 fill-current text-current" />}
    </span>
    {children}
  </DropdownMenuItem>
);

const DropdownMenuLabel: React.FC<React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }> = ({ className, inset, children, ...props }) => (
  <div className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)} {...props}>
    {children}
  </div>
);

const DropdownMenuSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <hr className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
);

const DropdownMenuShortcut: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)}>{children}</span>
);

const DropdownMenuGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
const DropdownMenuSub: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
const DropdownMenuSubTrigger: React.FC<React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }> = ({ className, inset, children, ...props }) => (
  <DropdownMenuItem className={cn('flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground', inset && 'pl-8', className)} {...props}>
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuItem>
);
const DropdownMenuSubContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2', className)} {...props}>
    {children}
  </div>
);

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent };