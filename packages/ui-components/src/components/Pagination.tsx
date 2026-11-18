// ============================================================================
// Pagination Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  siblingCount?: number;
  boundaryCount?: number;
  className?: string;
  'aria-label'?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  siblingCount = 1,
  boundaryCount = 1,
  className,
  'aria-label': ariaLabel = 'Pagination',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPaginationRange(currentPage, totalPages, siblingCount, boundaryCount);

  return (
    <nav aria-label={ariaLabel} className={cn('flex items-center gap-1', className)}>
      {showFirstLast && (
        <>
          <PaginationButton
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="First page"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </PaginationButton>
          <PaginationButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </PaginationButton>
        </>
      )}

      {pages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400 dark:text-gray-500" aria-hidden="true">
              ...
            </span>
          );
        }

        return (
          <PaginationButton
            key={page}
            onClick={() => onPageChange(page)}
            isActive={page === currentPage}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </PaginationButton>
        );
      })}

      {showFirstLast && (
        <>
          <PaginationButton
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </PaginationButton>
          <PaginationButton
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </PaginationButton>
        </>
      )}
    </nav>
  );
}

interface PaginationButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  'aria-label'?: string;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean;
  title?: string;
}

function PaginationButton({
  children,
  onClick,
  disabled = false,
  isActive = false,
  ...props
}: PaginationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center',
        'rounded-lg text-sm font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        disabled
          ? 'text-gray-400 cursor-not-allowed hover:bg-transparent'
          : isActive
          ? 'bg-primary-600 text-white hover:bg-primary-700'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
  boundaryCount: number
): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];

  // Always show first page
  pages.push(1);

  // Calculate start and end of middle range
  const startPage = Math.max(2, currentPage - siblingCount);
  const endPage = Math.min(totalPages - 1, currentPage + siblingCount);

  // Add ellipsis after first boundary if needed
  if (startPage > boundaryCount + 1) {
    pages.push('ellipsis');
  }

  // Add middle pages
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Add ellipsis before last boundary if needed
  if (endPage < totalPages - boundaryCount) {
    pages.push('ellipsis');
  }

  // Always show last page (if different from first)
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

export interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn('text-sm text-gray-500 dark:text-gray-400', className)}>
      Showing <span className="font-medium">{startItem}</span> to{' '}
      <span className="font-medium">{endItem}</span> of{' '}
      <span className="font-medium">{totalItems}</span> results
      {totalPages > 1 && (
        <> (Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>)</>
      )}
    </div>
  );
}

export interface PageSizeSelectProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  options?: number[];
  className?: string;
}

export function PageSizeSelect({
  pageSize,
  onPageSizeChange,
  options = [10, 25, 50, 100],
  className
}: PageSizeSelectProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <label htmlFor="page-size" className="text-sm text-gray-500 dark:text-gray-400">
        Rows per page:
      </label>
      <select
        id="page-size"
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}