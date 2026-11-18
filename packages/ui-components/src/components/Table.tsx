// ============================================================================
// Table Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyAccessor: keyof T | ((row: T) => string);
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  selectedRows?: Set<string>;
  onSelectionChange?: (selectedKeys: Set<string>) => void;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyAccessor,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  selectedRows,
  onSelectionChange,
  striped = true,
  hoverable = true,
  bordered = false,
  compact = false,
  emptyMessage = 'No data available',
  loading = false,
  className,
}: TableProps<T>) {
  const getRowKey = (row: T): string => {
    if (typeof keyAccessor === 'function') return keyAccessor(row);
    return String(row[keyAccessor]);
  };

  const isSelected = (row: T) => selectedRows?.has(getRowKey(row));

  const handleSort = (key: string) => {
    if (!onSort) return;
    if (sortBy === key) {
      onSort(key, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  const handleRowClick = (row: T, e: React.MouseEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement) return;
    onRowClick?.(row);
  };

  const handleSelectionChange = (row: T, checked: boolean) => {
    if (!onSelectionChange) return;
    const newSelection = new Set(selectedRows || []);
    const key = getRowKey(row);
    if (checked) newSelection.add(key);
    else newSelection.delete(key);
    onSelectionChange(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    const newSelection = new Set<string>();
    if (checked) {
      data.forEach(row => newSelection.add(getRowKey(row)));
    }
    onSelectionChange(newSelection);
  };

  if (loading) {
    return (
      <div className={cn('rounded-lg border bg-white dark:bg-gray-800', className)}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('rounded-lg border bg-white dark:bg-gray-800 p-8 text-center', className)}>
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-white dark:bg-gray-800 overflow-hidden', bordered && 'border-gray-200 dark:border-gray-700', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr className={cn(bordered && 'border-b dark:border-gray-700')}>
              {onSelectionChange && (
                <th className={cn('px-4 py-3', compact && 'py-2')}>
                  <input
                    type="checkbox"
                    checked={data.length > 0 && data.every(row => isSelected(row))}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400',
                    'whitespace-nowrap',
                    compact && 'py-2',
                    column.sortable && 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-300',
                    column.headerClassName
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortBy === column.key && (
                      sortOrder === 'asc' ? (
                        <ChevronUp className="h-4 w-4 text-primary-600" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-primary-600" aria-hidden="true" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, rowIndex) => {
              const rowKey = getRowKey(row);
              const selected = isSelected(row);

              return (
                <tr
                  key={rowKey}
                  className={cn(
                    'transition-colors',
                    striped && rowIndex % 2 === 1 && 'bg-gray-50 dark:bg-gray-800/50',
                    hoverable && 'hover:bg-gray-100 dark:hover:bg-gray-700/50',
                    onRowClick && 'cursor-pointer',
                    selected && 'bg-primary-50 dark:bg-primary-900/20',
                    compact && 'py-2'
                  )}
                  onClick={(e) => handleRowClick(row, e)}
                >
                  {onSelectionChange && (
                    <td className={cn('px-4 py-3', compact && 'py-2')}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectionChange(row, e.target.checked);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        aria-label={`Select row ${rowKey}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : row[column.accessor as keyof T];

                    return (
                      <td
                        key={column.key}
                        className={cn(
                          'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
                          compact && 'py-2',
                          column.cellClassName
                        )}
                      >
                        {column.render
                          ? column.render(value, row)
                          : typeof value === 'object' && value !== null
                          ? JSON.stringify(value)
                          : String(value ?? '')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: TablePaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t dark:border-gray-700">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
        <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="table-page-size" className="text-sm text-gray-500 dark:text-gray-400">
            Rows per page:
          </label>
          <select
            id="table-page-size"
            value={itemsPerPage}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <nav className="flex items-center gap-1" aria-label="Table pagination">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400"
            aria-label="First page"
          >
            ««
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400"
            aria-label="Previous page"
          >
            «
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let page: number;
            if (totalPages <= 5) page = i + 1;
            else if (currentPage <= 3) page = i + 1;
            else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
            else page = currentPage - 2 + i;

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  'w-8 h-8 rounded text-sm font-medium',
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400"
            aria-label="Next page"
          >
            »
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400"
            aria-label="Last page"
          >
            »»
          </button>
        </nav>
      </div>
    </div>
  );
}