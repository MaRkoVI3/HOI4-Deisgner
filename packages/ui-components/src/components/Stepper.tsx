// ============================================================================
// Stepper Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';
import { Check } from 'lucide-react';

export interface StepperProps {
  steps: Array<{
    label: string;
    description?: string;
    icon?: React.ReactNode;
    optional?: boolean;
  }>;
  currentStep: number;
  onStepClick?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  className
}: StepperProps) {
  return (
    <nav
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        className
      )}
      aria-label="Stepper"
    >
      <ol className={cn(
        'flex w-full',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
      )}>
        {steps.map((step, index) => (
          <StepperStep
            key={index}
            step={step}
            index={index}
            currentStep={currentStep}
            totalSteps={steps.length}
            orientation={orientation}
            onClick={onStepClick ? () => onStepClick(index) : undefined}
          />
        ))}
      </ol>
    </nav>
  );
}

interface StepperStepProps {
  step: StepperProps['steps'][0];
  index: number;
  currentStep: number;
  totalSteps: number;
  orientation: 'horizontal' | 'vertical';
  onClick?: () => void;
}

function StepperStep({
  step,
  index,
  currentStep,
  totalSteps,
  orientation,
  onClick
}: StepperStepProps) {
  const isActive = index === currentStep;
  const isCompleted = index < currentStep;
  const isLast = index === totalSteps - 1;

  const stepNumber = isCompleted ? (
    <Check className="h-5 w-5" aria-hidden="true" />
  ) : (
    <span className="text-sm font-medium">{index + 1}</span>
  );

  const stepButton = (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'relative flex flex-col items-center gap-2',
        onClick && 'cursor-pointer focus:outline-none',
        !onClick && 'pointer-events-none'
      )}
      aria-current={isActive ? 'step' : undefined}
      aria-disabled={!onClick}
    >
      <div
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-full border-2',
          'transition-all duration-200',
          isCompleted
            ? 'bg-primary-600 border-primary-600 text-white'
            : isActive
            ? 'border-primary-600 text-primary-600 bg-white dark:bg-gray-800'
            : 'border-gray-300 text-gray-400 bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500',
        )}
      >
        {stepNumber}
      </div>
      <div className="text-center">
        <span className={cn(
          'text-sm font-medium',
          isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
        )}>
          {step.label}
        </span>
        {step.optional && (
          <span className="text-xs text-gray-400 dark:text-gray-500">(Optional)</span>
        )}
      </div>
    </button>
  );

  const connector = !isLast && (
    <div
      className={cn(
        'absolute flex-1 h-0.5',
        orientation === 'horizontal' ? 'left-1/2 top-5' : 'top-1/2 left-5',
        isCompleted ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
      )}
      aria-hidden="true"
    />
  );

  if (orientation === 'horizontal') {
    return (
      <li className={cn('relative flex-1 flex flex-col items-center', isLast && 'flex-none')}>
        {stepButton}
        {connector}
      </li>
    );
  }

  return (
    <li className={cn('relative flex items-start gap-4', isLast && 'pb-0')}>
      <div className="relative flex flex-col items-center">
        {stepButton}
        {connector}
      </div>
      <div className="flex-1 pt-1">
        {step.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
        )}
      </div>
    </li>
  );
}

export interface StepperContentProps {
  step: number;
  children: React.ReactNode;
  className?: string;
}

export function StepperContent({ step, children, className }: StepperContentProps) {
  return (
    <div className={cn('mt-6', className)} role="tabpanel" aria-labelledby={`step-${step}`}>
      {children}
    </div>
  );
}

export interface StepperNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
  onComplete?: () => void;
  nextLabel?: string;
  backLabel?: string;
  completeLabel?: string;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  className?: string;
}

export function StepperNavigation({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onComplete,
  nextLabel = 'Next',
  backLabel = 'Back',
  completeLabel = 'Complete',
  isNextDisabled = false,
  isBackDisabled = false,
  className
}: StepperNavigationProps) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className={cn('flex justify-between mt-6 pt-4 border-t dark:border-gray-700', className)}>
      <button
        type="button"
        onClick={onBack}
        disabled={currentStep === 0 || isBackDisabled}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium',
          'rounded-lg border border-gray-300 bg-white text-gray-700',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        )}
      >
        {backLabel}
      </button>
      <button
        type="button"
        onClick={isLastStep ? onComplete : onNext}
        disabled={isNextDisabled}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium',
          'rounded-lg bg-primary-600 text-white',
          'hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isLastStep ? completeLabel : nextLabel}
      </button>
    </div>
  );
}