// ============================================================================
// Tabs Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface TabsProps {
  defaultValue: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs');
  }
  return context;
}

export function Tabs({ defaultValue, onValueChange, children, className }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn(className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

Tabs.displayName = 'Tabs';

export function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500',
        'dark:bg-gray-800 dark:text-gray-400',
        className
      )}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
}

TabsList.displayName = 'TabsList';

export function TabsTrigger({
  className,
  value,
  disabled = false,
  children,
  ...props
}: TabsTriggerProps) {
  const { value: currentValue, onValueChange } = useTabsContext();

  const isActive = currentValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabs-content-${value}`}
      id={`tabs-trigger-${value}`}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'transition-all duration-200',
        disabled
          ? 'text-gray-400 pointer-events-none'
          : isActive
          ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
          : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
        className
      )}
      onClick={() => !disabled && onValueChange(value)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

TabsTrigger.displayName = 'TabsTrigger';

export function TabsContent({
  className,
  value,
  children,
  ...props
}: TabsContentProps) {
  const { value: currentValue } = useTabsContext();

  if (currentValue !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`tabs-content-${value}`}
      aria-labelledby={`tabs-trigger-${value}`}
      className={cn(
        'mt-2 ring-offset-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'dark:ring-offset-gray-900',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

TabsContent.displayName = 'TabsContent';