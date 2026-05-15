'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Zap,
  Video,
  MessageCircle,
  Upload,
  Receipt,
  Check,
  Star,
  Clock,
  ChevronLeft,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { CountdownTimer } from '@/components/consultation/CountdownTimer';

const JITSI_DOMAIN = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'localhost:8080';

const beforeJoinTips = [
  'Ensure your camera and microphone are working',
  'Have your pet nearby and calm if possible',
  'Find a quiet, well-lit space for the consultation',
  'Have any medications your pet is currently taking ready to show',
  'Note the exact symptoms and when they started',
];

export default function ConsultationReadyPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.requestId as string;
  const [isJoining, setIsJoining] = useState(false);

  const roomName = `pawpet-urgent-${requestId}`;

  const handleJoinConsultation = () => {
    setIsJoining(true);
    const url = `http://${JITSI_DOMAIN}/${roomName}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => {
      router.push(`/consultations/${requestId}`);
    }, 1000);
  };

  const handleExpire = () => {
    router.push('/vet-consultancy/urgent');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      {/* Matched banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Check size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Your urgent consultation is ready!</h1>
            <p className="text-green-100 text-sm">Matched with first available vet — join now before time runs out</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Main card */}
        <div className="md:col-span-2 space-y-5">
          {/* Vet card */}
          <div className="bg-white border-2 border-green-200 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-green-700 font-bold text-xl">
                  AR
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-gray-900">Dr. Aisha Rahman</h2>
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </span>
                </div>
                <p className="text-sm text-primary font-medium">DVM Small Animal Specialist</p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Online now
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} className="text-yellow-400 fill-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">4.9 (234 reviews)</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock size={12} />
                    Responds in ~2 min
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation details */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Consultation details</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Type', value: 'Urgent Video Consult', icon: Video },
                { label: 'Pet', value: '3yr Male Indie Cat', icon: null },
                { label: 'Issue', value: 'Vomiting & Lethargy', icon: null },
                { label: 'Duration', value: 'Up to 30 minutes', icon: null },
                { label: 'Fee', value: '৳1,200 + ৳50 platform', icon: null },
                { label: 'Room', value: roomName.slice(0, 20) + '...', icon: null },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Countdown */}
          <div className="bg-white border-2 border-red-200 rounded-xl p-6 text-center">
            <p className="text-sm font-semibold text-red-700 mb-3 flex items-center justify-center gap-2">
              <AlertCircle size={16} />
              Vet is waiting — join before the session expires
            </p>
            <CountdownTimer
              initialSeconds={90}
              onExpire={handleExpire}
              label="Session expires in"
              size="lg"
            />
          </div>

          {/* Main CTA */}
          <button
            onClick={handleJoinConsultation}
            disabled={isJoining}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-primary text-white font-bold text-lg rounded-2xl hover:bg-primary-600 disabled:opacity-60 transition-all shadow-lg hover:shadow-xl"
          >
            {isJoining ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Joining consultation...
              </>
            ) : (
              <>
                <Zap size={22} />
                Join urgent consultation
              </>
            )}
          </button>

          {/* Secondary actions */}
          <div className="grid grid-cols-3 gap-3">
            <button className="flex flex-col items-center gap-1.5 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-800">
              <MessageCircle size={18} />
              <span className="text-xs font-medium">Message vet</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-800">
              <Upload size={18} />
              <span className="text-xs font-medium">Upload photos</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-800">
              <Receipt size={18} />
              <span className="text-xs font-medium">View receipt</span>
            </button>
          </div>
        </div>

        {/* Right: tips panel */}
        <div className="space-y-4">
          {/* Before you join */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-bold text-blue-900 mb-3">Before you join</h3>
            <ul className="space-y-2.5">
              {beforeJoinTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-blue-700 font-bold text-xs">{i + 1}</span>
                  </div>
                  <p className="text-xs text-blue-800">{tip}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Secure badge */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-green-500" />
              <p className="text-sm font-semibold text-gray-900">Secure consultation</p>
            </div>
            <p className="text-xs text-gray-500">
              This session is end-to-end encrypted. No recording without your consent.
            </p>
          </div>

          {/* Emergency note */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-700 mb-1">Still an emergency?</p>
                <p className="text-xs text-red-600">
                  If your pet&apos;s condition worsens, call your nearest 24/7 emergency animal clinic immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
