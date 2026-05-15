import React from 'react';
import clsx from 'clsx';
import { Check, Circle, Loader } from 'lucide-react';

export type StepStatus = 'completed' | 'in_progress' | 'pending';

export interface Step {
  label: string;
  description?: string;
  status: StepStatus;
}

interface ProgressStepsProps {
  steps: Step[];
  className?: string;
}

export function ProgressSteps({ steps, className }: ProgressStepsProps) {
  return (
    <div className={clsx('w-full', className)}>
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-center">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center text-center min-w-0 flex-1">
              {/* Icon */}
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                  {
                    'bg-green-500 border-green-500 text-white': step.status === 'completed',
                    'bg-primary border-primary text-white animate-pulse': step.status === 'in_progress',
                    'bg-white border-gray-300 text-gray-400': step.status === 'pending',
                  }
                )}
              >
                {step.status === 'completed' && <Check size={18} />}
                {step.status === 'in_progress' && <Loader size={18} className="animate-spin" />}
                {step.status === 'pending' && <Circle size={18} />}
              </div>

              {/* Label */}
              <p
                className={clsx('text-xs font-medium mt-2 px-1', {
                  'text-green-600': step.status === 'completed',
                  'text-primary': step.status === 'in_progress',
                  'text-gray-400': step.status === 'pending',
                })}
              >
                {step.label}
              </p>

              {/* Status badge */}
              {step.status !== 'pending' && (
                <span
                  className={clsx('text-xs mt-1 px-2 py-0.5 rounded-full font-medium', {
                    'bg-green-50 text-green-600': step.status === 'completed',
                    'bg-primary-50 text-primary': step.status === 'in_progress',
                  })}
                >
                  {step.status === 'completed' ? <Check size={14} /> : 'IN PROGRESS'}
                </span>
              )}
            </div>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div
                className={clsx('h-0.5 flex-1 mx-2 transition-colors', {
                  'bg-green-400': step.status === 'completed',
                  'bg-gray-200': step.status !== 'completed',
                })}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden space-y-3">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0',
                  {
                    'bg-green-500 border-green-500 text-white': step.status === 'completed',
                    'bg-primary border-primary text-white': step.status === 'in_progress',
                    'bg-white border-gray-300 text-gray-400': step.status === 'pending',
                  }
                )}
              >
                {step.status === 'completed' && <Check size={14} />}
                {step.status === 'in_progress' && <Loader size={14} className="animate-spin" />}
                {step.status === 'pending' && <Circle size={14} />}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={clsx('w-0.5 h-6 mt-1', {
                    'bg-green-300': step.status === 'completed',
                    'bg-gray-200': step.status !== 'completed',
                  })}
                />
              )}
            </div>
            <div className="pt-1">
              <p
                className={clsx('text-sm font-medium', {
                  'text-green-600': step.status === 'completed',
                  'text-primary': step.status === 'in_progress',
                  'text-gray-400': step.status === 'pending',
                })}
              >
                {step.label}
              </p>
              {step.status === 'in_progress' && (
                <span className="text-xs text-primary font-medium">In Progress</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressSteps;
