// ============================================================================
// DropdownMenu Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownMenuProps {
  children: React.ReactNode;
}

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end' | 'center';
  sideOffset?: number;
}

export interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
  shortcut?: string;
  checked?: boolean;
  icon?: React.ReactNode;
}

export interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownMenuContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
} | null>(null);

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenu components must be used within a DropdownMenu');
  }
  return context;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <DropdownMenuContext.Provider value={{ open, onOpenChange: setOpen, triggerRef }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} aria-hidden="true" />
      )}
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, className, ...props }: DropdownMenuTriggerProps) {
  const { open, onOpenChange, triggerRef } = useDropdownMenuContext();

  return (
    <button
      ref={triggerRef}
      type="button"
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900',
        'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
        className
      )}
      onClick={() => onOpenChange(!open)}
      aria-haspopup="true"
      aria-expanded={open}
      {...props}
    >
      {children}
      <ChevronDown className={cn('h-4 w-4', open && 'rotate-180')} aria-hidden="true" />
    </button>
  );
}

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export function DropdownMenuContent({
  className,
  align = 'start',
  sideOffset = 4,
  children,
  ...props
}: DropdownMenuContentProps) {
  const { open, triggerRef } = useDropdownMenuContext();
  if (!open) return null;

  const alignStyles = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const ctx = React.useContext(DropdownMenuContext);
        ctx?.onOpenChange(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div
      className={cn(
        'fixed z-50 mt-1.5 w-56 origin-top-right rounded-lg border border-gray-200 bg-white py-1 shadow-lg',
        'dark:border-gray-700 dark:bg-gray-800',
        'animate-in fade-in-0 zoom-in-95',
        alignStyles[align],
        className
      )}
      style={{ top: triggerRef.current?.getBoundingClientRect().bottom, left: triggerRef.current?.getBoundingClientRect().left }}
      role="menu"
      {...props}
    >
      {children}
    </div>
  );
}

DropdownMenuContent.displayName = 'DropdownMenuContent';

export function DropdownMenuItem({
  className,
  inset = false,
  shortcut,
  checked = false,
  icon,
  onClick,
  children,
  ...props
}: DropdownMenuItemProps) {
  const { onOpenChange } = useDropdownMenuContext();

  return (
    <button
      type="button"
      className={cn(
        'relative flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-900',
        'hover:bg-gray-100 focus:outline-none focus:bg-gray-100',
        'dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700',
        inset && 'pl-8',
        className
      )}
      onClick={(e) => {
        onOpenChange(false);
        onClick?.(e);
      }}
      role="menuitem"
      aria-checked={checked}
      {...props}
    >
      {icon && (
        <span className="flex h-4 w-4 items-center justify-center" aria-hidden="true">
          {icon}
        </span>
      )}
      {checked && (
        <Check className="h-4 w-4 text-primary-600" aria-hidden="true" />
      )}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span className="text-xs text-gray-500 dark:text-gray-400">{shortcut}</span>
      )}
    </button>
  );
}

DropdownMenuItem.displayName = 'DropdownMenuItem';

export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <div
      className={cn('h-px bg-gray-200 my-1', 'dark:bg-gray-700', className)}
      role="separator"
      {...props}
    />
  );
}

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export function DropdownMenuLabel({ className, children, ...props }: DropdownMenuLabelProps) {
  return (
    <div
      className={cn('px-3 py-2 text-xs font-semibold text-gray-500 uppercase', 'dark:text-gray-400', className)}
      {...props}
    >
      {children}
    </div>
  );
}

DropdownMenuLabel.displayName = 'DropdownMenuLabel';