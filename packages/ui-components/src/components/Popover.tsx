// ============================================================================
// Popover Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

export interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  modal?: boolean;
}

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  hideCloseButton?: boolean;
}

const PopoverContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  modal: boolean;
} | null>(null);

function usePopoverContext() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover components must be used within a Popover');
  }
  return context;
}

export function Popover({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  modal = false
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const setOpen = React.useCallback((value: boolean) => {
    if (!isControlled) setUncontrolledOpen(value);
    onOpenChange?.(value);
  }, [isControlled, onOpenChange]);

  React.useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, setOpen]);

  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      const popoverContent = document.querySelector('[data-popover-content]');
      if (popoverContent?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, setOpen]);

  return (
    <PopoverContext.Provider value={{ open, onOpenChange: setOpen, triggerRef, modal }}>
      {children}
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ children, className, ...props }: PopoverTriggerProps) {
  const { open, onOpenChange, triggerRef } = usePopoverContext();

  return (
    <button
      ref={triggerRef}
      type="button"
      className={cn('', className)}
      onClick={() => onOpenChange(!open)}
      aria-haspopup="dialog"
      aria-expanded={open}
      {...props}
    >
      {children}
    </button>
  );
}

PopoverTrigger.displayName = 'PopoverTrigger';

export function PopoverContent({
  className,
  align = 'center',
  side = 'bottom',
  sideOffset = 4,
  hideCloseButton = false,
  children,
  ...props
}: PopoverContentProps) {
  const { open, triggerRef, modal, onOpenChange } = usePopoverContext();

  if (!open) return null;

  const sidePositions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const alignPositions = {
    start: side === 'top' || side === 'bottom' ? 'left-0 -translate-x-0' : 'top-0 -translate-y-0',
    center: 'left-1/2 -translate-x-1/2',
    end: side === 'top' || side === 'bottom' ? 'right-0 -translate-x-0' : 'bottom-0 -translate-y-0',
  };

  return (
    <div
      className={cn(
        'fixed z-50',
        sidePositions[side],
        alignPositions[align]
      )}
      style={{
        top: triggerRef.current?.getBoundingClientRect().bottom,
        left: triggerRef.current?.getBoundingClientRect().left
      }}
      data-popover-content
      role="dialog"
      aria-modal={modal}
    >
      {modal && (
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          'relative w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg',
          'dark:border-gray-700 dark:bg-gray-800',
          'animate-in fade-in-0 zoom-in-95',
          className
        )}
        {...props}
      >
        {!hideCloseButton && (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-2 top-2 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

PopoverContent.displayName = 'PopoverContent';

export function PopoverAnchor({ children }: { children: React.ReactElement }) {
  return children;
}

export function PopoverClose({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = usePopoverContext();

  return (
    <button
      type="button"
      onClick={() => onOpenChange(false)}
      className={cn('rounded p-1 text-gray-400 hover:text-gray-600', className)}
      {...props}
    >
      <X className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

PopoverClose.displayName = 'PopoverClose';