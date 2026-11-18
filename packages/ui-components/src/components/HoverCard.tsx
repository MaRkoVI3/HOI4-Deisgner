// ============================================================================
// HoverCard Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface HoverCardProps {
  children: React.ReactElement;
  content: React.ReactNode;
  openDelay?: number;
  closeDelay?: number;
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function HoverCard({
  children,
  content,
  openDelay = 200,
  closeDelay = 100,
  sideOffset = 4,
  align = 'center',
  side = 'bottom',
}: HoverCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    timeoutRef.current = setTimeout(() => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setPosition({ x: rect.left, y: rect.top });
      setIsOpen(true);
    }, openDelay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(false), closeDelay);
  };

  const handleContentMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleContentMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), closeDelay);
  };

  const child = React.Children.only(children);

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
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...child.props}
      >
        {child.props.children}
      </div>
      {isOpen && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: position.x, top: position.y }}
        >
          <div
            className={cn(
              'absolute px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg',
              'dark:bg-gray-700',
              'whitespace-nowrap max-w-xs',
              'animate-in fade-in-0 zoom-in-95',
              sidePositions[side],
              alignPositions[align]
            )}
            onMouseEnter={handleContentMouseEnter}
            onMouseLeave={handleContentMouseLeave}
            role="tooltip"
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export interface HoverCardTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const HoverCardTrigger = React.forwardRef<HTMLDivElement, HoverCardTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  )
);

HoverCardTrigger.displayName = 'HoverCardTrigger';

export interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg dark:bg-gray-700', className)}
      {...props}
    >
      {children}
    </div>
  )
);

HoverCardContent.displayName = 'HoverCardContent';