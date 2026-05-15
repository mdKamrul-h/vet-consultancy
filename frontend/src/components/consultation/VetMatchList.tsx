import React from 'react';
import clsx from 'clsx';
import { Check, Clock, Bell, X } from 'lucide-react';
import { UrgentVetStatus } from '@/types';

interface VetMatchListProps {
  vets: UrgentVetStatus[];
}

const statusConfig = {
  accepted: {
    label: 'Accepted request',
    badgeClass: 'bg-green-50 text-green-700 border border-green-200',
    icon: Check,
    iconClass: 'text-green-500',
    rowClass: 'border-green-200 bg-green-50/30',
  },
  reviewing: {
    label: 'Reviewing',
    badgeClass: 'bg-orange-50 text-orange-700 border border-orange-200',
    icon: Clock,
    iconClass: 'text-orange-500',
    rowClass: 'border-gray-200',
  },
  notified: {
    label: 'Notified',
    badgeClass: 'bg-gray-50 text-gray-600 border border-gray-200',
    icon: Bell,
    iconClass: 'text-gray-400',
    rowClass: 'border-gray-200',
  },
  declined: {
    label: 'Declined',
    badgeClass: 'bg-red-50 text-red-600 border border-red-200',
    icon: X,
    iconClass: 'text-red-400',
    rowClass: 'border-gray-200 opacity-60',
  },
};

export function VetMatchList({ vets }: VetMatchListProps) {
  return (
    <div className="space-y-3">
      {vets.map((vetStatus) => {
        const config = statusConfig[vetStatus.status];
        const StatusIcon = config.icon;
        const initials = vetStatus.vet.name
          .split(' ')
          .slice(1)
          .map((n) => n[0])
          .join('')
          .slice(0, 2);

        return (
          <div
            key={vetStatus.vetId}
            className={clsx(
              'flex items-center gap-4 p-4 border rounded-xl transition-all',
              config.rowClass
            )}
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-orange-100 flex items-center justify-center text-primary font-bold">
                {initials}
              </div>
              {vetStatus.vet.isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{vetStatus.vet.name}</p>
                {vetStatus.vet.isVerified && (
                  <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{vetStatus.vet.specialty}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-yellow-500 text-xs">★</span>
                <span className="text-xs text-gray-600">{vetStatus.vet.rating}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">{vetStatus.vet.experience} yrs exp</span>
              </div>
            </div>

            {/* Status badge */}
            <div className="shrink-0">
              <span className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold', config.badgeClass)}>
                <StatusIcon size={12} className={config.iconClass} />
                {config.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default VetMatchList;
