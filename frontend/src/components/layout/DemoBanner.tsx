'use client';

import { Info } from 'lucide-react';
import { isDemoMode } from '@/lib/demo';

export function DemoBanner() {
  if (!isDemoMode) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
      <span className="inline-flex items-center gap-1.5">
        <Info size={14} className="shrink-0" />
        Demo mode — all data is simulated. No backend connection required.
      </span>
    </div>
  );
}
