// ============================================================================
// Dialog Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

function useDialogContext() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog');
  }
  return context;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/50 animate-in fade-in"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children, ...props }: DialogTriggerProps) {
  const { open, onOpenChange } = useDialogContext();
  if (!open) return null; // Only render when dialog context is available

  return (
    <button
      type="button"
      onClick={() => onOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  );
}

DialogTrigger.displayName = 'DialogTrigger';

export function DialogContent({
  className,
  title,
  description,
  children,
  ...props
}: DialogContentProps) {
  const { open, onOpenChange } = useDialogContext();
  if (!open) return null;

  const contentId = React.useId();
  const titleId = title ? `${contentId}-title` : undefined;
  const descriptionId = description ? `${contentId}-description` : undefined;

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onOpenChange]);

  return (
    <div
      className={cn(
        'relative z-50 w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 shadow-xl',
        'animate-in zoom-in-95 fade-in-0',
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="flex items-start justify-between p-6 border-b dark:border-gray-700">
          <div>
            {title && (
              <DialogTitle id={titleId}>{title}</DialogTitle>
            )}
            {description && (
              <DialogDescription id={descriptionId}>{description}</DialogDescription>
            )}
          </div>
          <DialogClose onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </DialogClose>
        </div>
      )}
      <div className="p-6" role="document" aria-labelledby={titleId} aria-describedby={descriptionId}>
        {children}
      </div>
    </div>
  );
}

DialogContent.displayName = 'DialogContent';

export function DialogHeader({ className, children, ...props }: DialogHeaderProps) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...props}
    >
      {children}
    </div>
  );
}

DialogHeader.displayName = 'DialogHeader';

export function DialogFooter({ className, children, ...props }: DialogFooterProps) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
      {...props}
    >
      {children}
    </div>
  );
}

DialogFooter.displayName = 'DialogFooter';

export function DialogTitle({ className, children, ...props }: DialogTitleProps) {
  return (
    <h2
      className={cn('text-lg font-semibold text-gray-900 dark:text-gray-100', className)}
      {...props}
    >
      {children}
    </h2>
  );
}

DialogTitle.displayName = 'DialogTitle';

export function DialogDescription({ className, children, ...props }: DialogDescriptionProps) {
  return (
    <p
      className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
      {...props}
    >
      {children}
    </p>
  );
}

DialogDescription.displayName = 'DialogDescription';

export function DialogClose({ className, children, onClick, ...props }: DialogCloseProps) {
  const { onOpenChange } = useDialogContext();

  return (
    <button
      type="button"
      className={cn(
        'rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        className
      )}
      onClick={(e) => {
        onOpenChange?.(false);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

DialogClose.displayName = 'DialogClose';