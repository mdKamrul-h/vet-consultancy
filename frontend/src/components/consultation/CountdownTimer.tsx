'use client';

import React, { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  initialSeconds: number;
  onExpire?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function CountdownTimer({
  initialSeconds,
  onExpire,
  className,
  size = 'md',
  label = 'Session expires in',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [expired, setExpired] = useState(false);

  const handleExpire = useCallback(() => {
    setExpired(true);
    if (onExpire) onExpire();
  }, [onExpire]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleExpire();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, handleExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isUrgent = timeLeft <= 30;
  const isWarning = timeLeft <= 60 && timeLeft > 30;

  if (expired) {
    return (
      <div className={clsx('text-center', className)}>
        <div className="text-red-600 font-bold text-2xl">Session expired</div>
        <p className="text-sm text-gray-500 mt-1">The vet is no longer available</p>
      </div>
    );
  }

  return (
    <div className={clsx('flex flex-col items-center gap-2', className)}>
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Clock size={16} />
        <span>{label}</span>
      </div>
      <div
        className={clsx(
          'font-mono font-bold tabular-nums rounded-xl px-6 py-3 border-2',
          {
            // Sizes
            'text-2xl': size === 'sm',
            'text-4xl': size === 'md',
            'text-6xl': size === 'lg',

            // Colors
            'text-red-600 border-red-300 bg-red-50 animate-pulse': isUrgent,
            'text-orange-600 border-orange-300 bg-orange-50': isWarning,
            'text-gray-800 border-gray-200 bg-white': !isUrgent && !isWarning,
          }
        )}
      >
        {formattedTime}
      </div>
      {isUrgent && (
        <p className="text-xs text-red-600 font-semibold animate-pulse">
          Hurry! Join before the vet leaves
        </p>
      )}
    </div>
  );
}

export default CountdownTimer;
