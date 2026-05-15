'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Zap,
  CheckCircle,
  Clock,
  MessageCircle,
  ChevronLeft,
  AlertCircle,
  Bell,
} from 'lucide-react';
import { ProgressSteps, Step } from '@/components/consultation/ProgressSteps';
import { VetMatchList } from '@/components/consultation/VetMatchList';
import { UrgentVetStatus, Vet } from '@/types';
import { connectSocket } from '@/lib/socket';

const mockVets: Vet[] = [
  {
    id: 'v1',
    userId: 'u1',
    name: 'Dr. Aisha Rahman',
    specialty: 'Small Animal Specialist',
    degree: 'DVM',
    experience: 8,
    rating: 4.9,
    reviewCount: 234,
    isOnline: true,
    responseTime: '~2 min',
    languages: ['English', 'Bengali'],
    consultationFee: 800,
    urgentFee: 1200,
    isVerified: true,
    consultationTypes: ['video', 'chat'],
  },
  {
    id: 'v2',
    userId: 'u2',
    name: 'Dr. Tanvir Ahmed',
    specialty: 'General Veterinarian',
    degree: 'DVM, MVSc',
    experience: 5,
    rating: 4.7,
    reviewCount: 156,
    isOnline: true,
    responseTime: '~5 min',
    languages: ['Bengali', 'English'],
    consultationFee: 600,
    urgentFee: 1000,
    isVerified: true,
    consultationTypes: ['video', 'chat'],
  },
  {
    id: 'v3',
    userId: 'u3',
    name: 'Dr. Mitu Saha',
    specialty: 'Exotic Animals',
    degree: 'DVM',
    experience: 6,
    rating: 4.8,
    reviewCount: 189,
    isOnline: true,
    responseTime: '~3 min',
    languages: ['Bengali'],
    consultationFee: 750,
    urgentFee: 1100,
    isVerified: true,
    consultationTypes: ['chat'],
  },
  {
    id: 'v4',
    userId: 'u4',
    name: 'Dr. Shohel Islam',
    specialty: 'Surgery & Critical Care',
    degree: 'DVM, PhD',
    experience: 12,
    rating: 5.0,
    reviewCount: 312,
    isOnline: true,
    responseTime: '~1 min',
    languages: ['Bengali', 'English'],
    consultationFee: 1000,
    urgentFee: 1500,
    isVerified: true,
    consultationTypes: ['video'],
  },
];

type ProgressStatus = 'completed' | 'in_progress' | 'pending';

interface ProgressState {
  detailsSubmitted: ProgressStatus;
  paymentConfirmed: ProgressStatus;
  vetsNotified: ProgressStatus;
  firstVetAccepts: ProgressStatus;
  sessionStarts: ProgressStatus;
}

const initialProgress: ProgressState = {
  detailsSubmitted: 'completed',
  paymentConfirmed: 'completed',
  vetsNotified: 'completed',
  firstVetAccepts: 'in_progress',
  sessionStarts: 'pending',
};

const initialVetStatuses: UrgentVetStatus[] = [
  { vetId: 'v1', vet: mockVets[0], status: 'notified', notifiedAt: new Date().toISOString() },
  { vetId: 'v2', vet: mockVets[1], status: 'notified', notifiedAt: new Date().toISOString() },
  { vetId: 'v3', vet: mockVets[2], status: 'notified', notifiedAt: new Date().toISOString() },
  { vetId: 'v4', vet: mockVets[3], status: 'notified', notifiedAt: new Date().toISOString() },
];

export default function UrgentProgressPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.requestId as string;

  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  const [vetStatuses, setVetStatuses] = useState<UrgentVetStatus[]>(initialVetStatuses);
  const [acceptedVet, setAcceptedVet] = useState<Vet | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handleVetAccepted = useCallback((vetId: string) => {
    setVetStatuses((prev) =>
      prev.map((vs) => {
        if (vs.vetId === vetId) return { ...vs, status: 'accepted', respondedAt: new Date().toISOString() };
        return vs;
      })
    );

    const vet = mockVets.find((v) => v.id === vetId);
    if (vet) {
      setAcceptedVet(vet);
      setProgress((prev) => ({
        ...prev,
        firstVetAccepts: 'completed',
        sessionStarts: 'in_progress',
      }));
    }
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    // Try to attach socket listeners (real events override simulation)
    let socketCleanup: (() => void) | undefined;
    try {
      const socket = connectSocket();
      socket.on(`urgent:vet_reviewing`, (data: { vetId: string }) => {
        setVetStatuses((prev) =>
          prev.map((vs) =>
            vs.vetId === data.vetId ? { ...vs, status: 'reviewing' } : vs
          )
        );
      });
      socket.on(`urgent:vet_accepted`, (data: { vetId: string }) => {
        handleVetAccepted(data.vetId);
      });
      socket.emit('join_room', `urgent:${requestId}`);
      socketCleanup = () => {
        socket.off(`urgent:vet_reviewing`);
        socket.off(`urgent:vet_accepted`);
      };
    } catch {
      // Socket not available — simulation below handles it
    }

    // Always run demo simulation so the flow progresses in local testing
    const t1 = setTimeout(() => {
      setVetStatuses((prev) =>
        prev.map((vs, i) => (i === 1 ? { ...vs, status: 'reviewing' } : vs))
      );
    }, 2000);

    const t2 = setTimeout(() => {
      setVetStatuses((prev) =>
        prev.map((vs, i) => (i === 2 ? { ...vs, status: 'reviewing' } : vs))
      );
    }, 4000);

    const t3 = setTimeout(() => {
      handleVetAccepted('v1');
    }, 6000);

    return () => {
      socketCleanup?.();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [requestId, handleVetAccepted]);

  const steps: Step[] = [
    { label: 'Details submitted', description: 'Request sent', status: progress.detailsSubmitted },
    { label: 'Payment confirmed', description: 'Payment processed', status: progress.paymentConfirmed },
    { label: 'Vets notified', description: 'Searching vets', status: progress.vetsNotified },
    { label: 'First vet accepts', description: 'Waiting for acceptance', status: progress.firstVetAccepts },
    { label: 'Session starts', description: 'Join consultation', status: progress.sessionStarts },
  ];

  return (
    <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => router.push('/vet-consultancy')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft size={16} />
        Back to Vet Consultancy
      </button>

      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap size={24} className="text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Searching online vets for your urgent request</h1>
            <p className="text-orange-100 text-sm">Our system is notifying available veterinarians right now</p>
          </div>
        </div>

        {/* Payment confirmed banner */}
        <div className="flex items-center gap-2 bg-white/15 rounded-xl p-3 mt-3">
          <CheckCircle size={18} className="text-green-300" />
          <span className="text-sm font-semibold">Payment confirmed — ৳1,250 will be charged once vet accepts</span>
        </div>
      </div>

      {/* Progress steps */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-6">Request progress</h2>
        <ProgressSteps steps={steps} />
      </div>

      {/* Live vet list */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Online vets reviewing your request</h2>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Bell size={13} className="animate-bounce" />
            Live updates
          </span>
        </div>
        <VetMatchList vets={vetStatuses} />
      </div>

      {/* Accepted vet banner */}
      {acceptedVet && (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-green-700 font-bold text-lg">
                  {acceptedVet.name.split(' ').slice(1).map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-gray-900">{acceptedVet.name}</h3>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    <CheckCircle size={14} className="inline mr-1" /> Accepted your request
                  </span>
                </div>
                <p className="text-sm text-gray-600">{acceptedVet.specialty} · {acceptedVet.degree}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-500 text-xs">★ {acceptedVet.rating}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-600">{acceptedVet.experience} yrs experience</span>
                  <span className="text-xs text-gray-400">·</span>
                  <Clock size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-600">Responds in {acceptedVet.responseTime}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Link
                href={`/vet-consultancy/urgent/${requestId}/ready`}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-600 transition-colors"
              >
                <Zap size={16} />
                Join urgent consultation
              </Link>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-green-400 text-green-700 font-semibold text-sm rounded-xl hover:bg-green-100 transition-colors">
                <MessageCircle size={16} />
                Message vet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request summary + Right panel */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Request summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-bold text-gray-900 mb-4">Your urgent request summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Pet', value: 'Luna (3yr Female Indie Cat)' },
              { label: 'Issue', value: 'Vomiting and lethargy since morning' },
              { label: 'Urgency', value: 'High' },
              { label: 'Mode', value: 'Video consultation' },
              { label: 'Request ID', value: `#${requestId.slice(-8).toUpperCase()}` },
              { label: 'Submitted', value: new Date().toLocaleTimeString() },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-500 w-24 shrink-0">{item.label}:</span>
                <span className="text-sm text-gray-800 font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-bold text-gray-900 mb-4">What happens next?</h3>
          <div className="space-y-3">
            {[
              { icon: Bell, text: 'Nearby online vets are being notified', done: true },
              { icon: Clock, text: 'First vet to accept becomes your consultant', done: !!acceptedVet },
              { icon: CheckCircle, text: 'You receive an acceptance notification', done: !!acceptedVet },
              { icon: Zap, text: 'Join the video/chat session immediately', done: false },
              { icon: AlertCircle, text: 'Get expert advice and prescription if needed', done: false },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    item.done ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Icon size={13} className={item.done ? 'text-green-600' : 'text-gray-400'} />
                  </div>
                  <p className={`text-sm ${item.done ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-2 bg-red-50 rounded-lg p-3">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">
                <span className="font-semibold">Emergency tip:</span> If your pet stops breathing, call the nearest 24/7 animal emergency clinic immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {!acceptedVet && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-500">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Searching for available vets... This usually takes 2–5 minutes</span>
        </div>
      )}
    </div>
  );
}
