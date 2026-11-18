// ============================================================================
// ComparisonTable Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface ComparisonTableProps<T> {
  items: T[];
  fields: Array<{
    key: keyof T | string;
    label: string;
    format?: (value: unknown) => React.ReactNode;
    highlightBest?: boolean;
    higherIsBetter?: boolean;
  }>;
  keyAccessor: keyof T | ((item: T) => string);
  getItemName: (item: T) => string;
  className?: string;
}

export function ComparisonTable<T>({
  items,
  fields,
  keyAccessor,
  getItemName,
  className,
}: ComparisonTableProps<T>) {
  if (items.length === 0) {
    return (
      <div className={cn('rounded-lg border bg-white dark:bg-gray-800 p-8 text-center', className)}>
        <p className="text-gray-500 dark:text-gray-400">No items to compare</p>
      </div>
    );
  }

  const getKey = (item: T): string => {
    if (typeof keyAccessor === 'function') return keyAccessor(item);
    return String(item[keyAccessor]);
  };

  // Calculate best values for each field
  const bestValues: Record<string, unknown> = {};
  fields.forEach(field => {
    if (!field.highlightBest) return;
    const values = items.map(item => {
      const key = typeof field.key === 'string' ? field.key : String(field.key);
      const value = (item as Record<string, unknown>)[key];
      return typeof value === 'number' ? value : 0;
    });
    if (values.length === 0) return;
    bestValues[String(field.key)] = field.higherIsBetter
      ? Math.max(...values)
      : Math.min(...values);
  });

  return (
    <div className={cn('rounded-lg border bg-white dark:bg-gray-800 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Property
              </th>
              {items.map((item, index) => (
                <th key={getKey(item)} className="px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {getItemName(item)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {fields.map((field, fieldIndex) => (
              <tr key={String(field.key)} className={fieldIndex % 2 === 1 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}>
                <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                </td>
                {items.map((item, itemIndex) => {
                  const key = typeof field.key === 'string' ? field.key : String(field.key);
                  const value = (item as Record<string, unknown>)[key];
                  const isBest = bestValues[key] !== undefined &&
                    typeof value === 'number' &&
                    value === bestValues[key];

                  const formattedValue = field.format
                    ? field.format(value)
                    : typeof value === 'number'
                    ? value.toLocaleString()
                    : String(value ?? '—');

                  return (
                    <td
                      key={getKey(item)}
                      className={cn(
                        'px-4 py-3 text-center text-sm',
                        isBest && 'font-bold text-green-600 dark:text-green-400'
                      )}
                    >
                      {formattedValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export interface ComparisonCardProps<T> {
  item: T;
  fields: Array<{
    key: keyof T | string;
    label: string;
    format?: (value: unknown) => React.ReactNode;
    icon?: React.ReactNode;
  }>;
  getItemName: (item: T) => string;
  getItemImage?: (item: T) => string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ComparisonCard<T>({
  item,
  fields,
  getItemName,
  getItemImage,
  selected = false,
  onClick,
  className,
}: ComparisonCardProps<T>) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white dark:bg-gray-800 p-4 transition-all',
        'hover:shadow-lg',
        selected ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200 dark:border-gray-700',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {getItemImage && (
        <div className="mb-4 aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={getItemImage(item)}
            alt={getItemName(item)}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
        {getItemName(item)}
      </h3>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              {field.icon && <span>{field.icon}</span>}
              <span>{field.label}</span>
            </div>
            <div className="text-right">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {field.format
                  ? field.format((item as Record<string, unknown>)[typeof field.key === 'string' ? field.key : String(field.key)])
                  : String((item as Record<string, unknown>)[typeof field.key === 'string' ? field.key : String(field.key)] ?? '—')
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}