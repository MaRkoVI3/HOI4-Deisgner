// ============================================================================
// Toast Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
  action?: React.ReactNode;
}

const variantStyles = {
  default: 'bg-gray-900 text-gray-100 dark:bg-gray-100 dark:text-gray-900',
  destructive: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800',
  success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800',
  info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800',
};

const variantIcons = {
  default: AlertCircle,
  destructive: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantIconColors = {
  default: 'text-gray-400',
  destructive: 'text-red-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export function Toast({
  id,
  title,
  description,
  variant = 'default',
  duration = 5000,
  onClose,
  action
}: ToastProps) {
  const Icon = variantIcons[variant];
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 rounded-lg border p-4 shadow-lg',
        'animate-in slide-in-from-right duration-300',
        'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right',
        variantStyles[variant]
      )}
      role="alert"
      data-state={visible ? 'open' : 'closed'}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', variantIconColors[variant])} aria-hidden="true" />
      <div className="flex-1">
        {title && <h4 className="font-medium">{title}</h4>}
        {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
        {action && <div className="mt-3">{action}</div>}
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onClose(id), 300);
        }}
        className="shrink-0 rounded p-1 opacity-50 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

interface ToastItem extends ToastProps {}

export interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((props: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = generateId();
    const newToast: ToastItem = { ...props, id, onClose: dismiss };
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </>
  );
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

// Hook for using toasts
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

const ToastContext = React.createContext<{
  toast: (props: Omit<ToastProps, 'id' | 'onClose'>) => string;
  dismiss: (id: string) => void;
} | null>(null);