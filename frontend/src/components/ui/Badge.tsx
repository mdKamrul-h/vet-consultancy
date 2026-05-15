import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'green' | 'gray' | 'red' | 'yellow' | 'blue' | 'orange';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'gray', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
          'bg-primary-50 text-primary-500': variant === 'primary',
          'bg-vet-green-50 text-vet-green-500': variant === 'green',
          'bg-gray-100 text-gray-600': variant === 'gray',
          'bg-red-50 text-red-600': variant === 'red',
          'bg-yellow-50 text-yellow-700': variant === 'yellow',
          'bg-blue-50 text-blue-600': variant === 'blue',
          'bg-orange-50 text-orange-600': variant === 'orange',
        },
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
