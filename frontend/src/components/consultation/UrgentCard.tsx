import React from 'react';
import Link from 'next/link';
import { Zap, FileText, Search, CheckCircle, Video } from 'lucide-react';

const steps = [
  { icon: FileText, label: 'Describe your pet\'s issue', step: 1 },
  { icon: Search, label: 'System searches available vets', step: 2 },
  { icon: CheckCircle, label: 'First available vet accepts', step: 3 },
  { icon: Video, label: 'Start video/chat session', step: 4 },
];

export function UrgentCard() {
  return (
    <div className="bg-white border-2 border-primary rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-primary px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={20} className="text-white" />
          <h3 className="text-lg font-bold text-white">Urgent Consultancy</h3>
        </div>
        <p className="text-primary-100 text-sm">
          Connect with the first available vet immediately
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-semibold rounded-full">
            <Zap size={10} className="inline mr-0.5" /> Avg. wait: 2-5 min
          </span>
          <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-semibold rounded-full">
            24/7 available
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="p-5 flex-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          How it works
        </p>
        <div className="space-y-3">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-50 border-2 border-primary flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {s.step}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-0.5 h-4 bg-primary-100 mt-1" />
                  )}
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-primary" />
                    <p className="text-sm text-gray-700">{s.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fee info */}
        <div className="mt-5 p-3 bg-primary-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Consultation fee</p>
              <p className="text-lg font-bold text-primary">From ৳1,200</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-sm font-semibold text-gray-700">Up to 30 min</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-5 pt-0">
        <Link
          href="/vet-consultancy/urgent"
          className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-600 transition-colors text-sm"
        >
          <Zap size={16} />
          Start urgent request
        </Link>
        <p className="text-xs text-gray-500 text-center mt-2">
          Payment charged after vet accepts
        </p>
      </div>
    </div>
  );
}

export default UrgentCard;
