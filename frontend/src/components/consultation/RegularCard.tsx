import React from 'react';
import Link from 'next/link';
import { Calendar, User, Heart, CreditCard, Video, MessageCircle } from 'lucide-react';

const steps = [
  { icon: Heart, label: 'Share your pet\'s health details', step: 1 },
  { icon: User, label: 'Browse verified vet profiles', step: 2 },
  { icon: Calendar, label: 'Choose vet & schedule time', step: 3 },
  { icon: CreditCard, label: 'Pay & confirm consultation', step: 4 },
];

export function RegularCard() {
  return (
    <div className="bg-white border-2 border-vet-green rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-vet-green px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <Calendar size={20} className="text-white" />
          <h3 className="text-lg font-bold text-white">Regular Online Consultation</h3>
        </div>
        <p className="text-green-100 text-sm">
          Browse and choose from our verified vet network
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-semibold rounded-full">
            <Video size={10} className="inline mr-1" />
            Video & Chat
          </span>
          <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-semibold rounded-full">
            <MessageCircle size={10} className="inline mr-1" />
            Flexible schedule
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
                  <div className="w-8 h-8 rounded-full bg-vet-green-50 border-2 border-vet-green flex items-center justify-center text-vet-green font-bold text-sm shrink-0">
                    {s.step}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-0.5 h-4 bg-vet-green-100 mt-1" />
                  )}
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-vet-green" />
                    <p className="text-sm text-gray-700">{s.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fee info */}
        <div className="mt-5 p-3 bg-vet-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Consultation fee</p>
              <p className="text-lg font-bold text-vet-green">From ৳600</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-sm font-semibold text-gray-700">30-60 min</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-5 pt-0">
        <Link
          href="/vet-consultancy/browse"
          className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-vet-green text-white font-bold rounded-lg hover:bg-vet-green-600 transition-colors text-sm"
        >
          <Calendar size={16} />
          Book consultation
        </Link>
        <p className="text-xs text-gray-500 text-center mt-2">
          Pay securely before session starts
        </p>
      </div>
    </div>
  );
}

export default RegularCard;
