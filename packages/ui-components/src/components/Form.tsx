// ============================================================================
// Form Components
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, children, ...props }, ref) => (
    <form ref={ref} className={cn('space-y-6', className)} {...props}>
      {children}
    </form>
  )
);

Form.displayName = 'Form';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, name, label, required, error, helperText, children, ...props }, ref) => {
    const fieldId = `field-${name}`;
    const errorId = error ? `${fieldId}-error` : undefined;
    const helperId = helperText ? `${fieldId}-helper` : undefined;

    return (
      <div ref={ref} className={cn('space-y-1.5', className)} {...props}>
        {label && (
          <label
            htmlFor={fieldId}
            className={cn(
              'block text-sm font-medium text-gray-700 dark:text-gray-300',
              required && 'after:content-["*"] after:ml-1 after:text-red-500'
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child;
            return React.cloneElement(child, {
              id: fieldId,
              'aria-invalid': error ? 'true' : 'false',
              'aria-describedby': cn(errorId, helperId),
              'aria-required': required,
            });
          })}
        </div>
        {error && (
          <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1', className)}
      {...props}
    >
      {children}
    </label>
  )
);

FormLabel.displayName = 'FormLabel';

export interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  type?: 'error' | 'success' | 'warning' | 'info';
}

export const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, type = 'error', children, ...props }, ref) => {
    const typeStyles = {
      error: 'text-red-600 dark:text-red-400',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      info: 'text-blue-600 dark:text-blue-400',
    };

    return (
      <p
        ref={ref}
        className={cn('text-sm mt-1', typeStyles[type], className)}
        role={type === 'error' ? 'alert' : 'status'}
        {...props}
      >
        {children}
      </p>
    );
  }
);

FormMessage.displayName = 'FormMessage';