// ============================================================================
// Modal Component (wrapper around Dialog)
// ============================================================================

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from './Dialog';
import { cn } from '../lib/utils';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}: ModalProps) {
  const handleEscape = React.useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && closeOnEscape) onOpenChange(false);
  }, [closeOnEscape, onOpenChange]);

  React.useEffect(() => {
    if (open && closeOnEscape) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, handleEscape]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(sizeStyles[size], className)}
        onPointerDown={closeOnOverlayClick ? (e) => {
          if (e.target === e.currentTarget) onOpenChange(false);
        } : undefined}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
        {!showCloseButton && (
          <DialogClose className="absolute right-4 top-4">
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </DialogClose>
        )}
      </DialogContent>
    </Dialog>
  );
}

export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  loading?: boolean;
  className?: string;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  loading = false,
  className,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size="sm"
      className={className}
    >
      <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
      <DialogFooter>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg',
            'border border-gray-300 bg-white text-gray-700',
            'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          )}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={() => { onConfirm(); onOpenChange(false); }}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg',
            variant === 'destructive'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-primary-600 text-white hover:bg-primary-700',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            variant === 'destructive' && 'focus:ring-red-500 focus:ring-offset-red-500',
            variant !== 'destructive' && 'focus:ring-primary-500 focus:ring-offset-white'
          )}
          disabled={loading}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </DialogFooter>
    </Modal>
  );
}

export interface AlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  onConfirm: () => void;
  className?: string;
}

const variantIcons = {
  info: (
    <svg className="h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="h-12 w-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function AlertModal({
  open,
  onOpenChange,
  title,
  message,
  confirmText = 'OK',
  variant = 'info',
  onConfirm,
  className,
}: AlertModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size="sm"
      className={className}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">{variantIcons[variant]}</div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <DialogFooter className="w-full justify-center">
          <button
            type="button"
            onClick={() => { onConfirm(); onOpenChange(false); }}
            className={cn(
              'px-6 py-2 text-sm font-medium rounded-lg',
              variant === 'error'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : variant === 'success'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : variant === 'warning'
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-primary-600 text-white hover:bg-primary-700',
              'focus:outline-none focus:ring-2 focus:ring-offset-2'
            )}
          >
            {confirmText}
          </button>
        </DialogFooter>
      </div>
    </Modal>
  );
}