import React from 'react';
import { Check } from 'lucide-react';
import { Vet } from '@/types';

interface OnlineVetItemProps {
  vet: Vet;
  onUrgent?: () => void;
  onBook?: () => void;
}

export function OnlineVetItem({ vet, onUrgent, onBook }: OnlineVetItemProps) {
  const initials = vet.name
    .split(' ')
    .slice(1)
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-orange-100 flex items-center justify-center text-primary font-bold text-sm">
          {initials}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{vet.name}</p>
          {vet.isVerified && (
            <span className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
              <Check size={8} className="text-white" />
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{vet.specialty}</p>
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-xs text-gray-600">{vet.rating}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 shrink-0">
        <button
          onClick={onUrgent}
          className="px-2 py-1 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-600 transition-colors"
        >
          Urgent
        </button>
        <button
          onClick={onBook}
          className="px-2 py-1 border border-vet-green text-vet-green text-xs font-semibold rounded-md hover:bg-vet-green-50 transition-colors"
        >
          Book
        </button>
      </div>
    </div>
  );
}

export default OnlineVetItem;
