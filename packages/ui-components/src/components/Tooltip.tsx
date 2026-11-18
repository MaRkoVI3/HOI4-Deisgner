// ============================================================================
// Tooltip Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';

export interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export interface TooltipProviderProps {
  children: React.ReactNode;
}

const TooltipContext = React.createContext<{
  openTooltip: (id: string, content: React.ReactNode, position: string) => void;
  closeTooltip: (id: string) => void;
} | null>(null);

function useTooltipContext() {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error('Tooltip must be used within TooltipProvider');
  }
  return context;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  const [tooltips, setTooltips] = React.useState<Record<string, { content: React.ReactNode; position: string }>>({});

  const openTooltip = React.useCallback((id: string, content: React.ReactNode, position: string) => {
    setTooltips(prev => ({ ...prev, [id]: { content, position } }));
  }, []);

  const closeTooltip = React.useCallback((id: string) => {
    setTooltips(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  return (
    <TooltipContext.Provider value={{ openTooltip, closeTooltip }}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
        {Object.entries(tooltips).map(([id, { content, position }]) => (
          <TooltipContent key={id} id={id} content={content} position={position as TooltipProps['position']} />
        ))}
      </div>
    </TooltipContext.Provider>
  );
}

interface TooltipContentProps {
  id: string;
  content: React.ReactNode;
  position: TooltipProps['position'];
}

function TooltipContent({ id, content, position = 'top' }: TooltipContentProps) {
  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900',
  };

  return (
    <div className={cn('fixed z-50', positionStyles[position])} role="tooltip" id={id}>
      <div className={cn(
        'px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg',
        'dark:bg-gray-700',
        'whitespace-nowrap max-w-xs'
      )}>
        {content}
      </div>
      <div className={cn(
        'absolute w-0 h-0 border-4 border-transparent',
        arrowStyles[position]
      )} />
    </div>
  );
}

export function Tooltip({ children, content, position = 'top', delay = 200, className }: TooltipProps) {
  const { openTooltip, closeTooltip } = useTooltipContext();
  const [isOpen, setIsOpen] = React.useState(false);
  const tooltipId = React.useRef(`tooltip-${generateId()}`);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
      openTooltip(tooltipId.current, content, position);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
    closeTooltip(tooltipId.current);
  };

  const handleFocus = () => {
    setIsOpen(true);
    openTooltip(tooltipId.current, content, position);
  };

  const handleBlur = () => {
    setIsOpen(false);
    closeTooltip(tooltipId.current);
  };

  const child = React.Children.only(children);

  return React.cloneElement(child, {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    'aria-describedby': isOpen ? tooltipId.current : undefined,
    className: cn(child.props.className, className),
  });
}

Tooltip.displayName = 'Tooltip';

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}