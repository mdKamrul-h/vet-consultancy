'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Star, Globe, Zap, Calendar, Check, PawPrint, Building2, Lock } from 'lucide-react';
import { UrgentCard } from '@/components/consultation/UrgentCard';
import { RegularCard } from '@/components/consultation/RegularCard';
import { OnlineVetsPanel } from '@/components/layout/OnlineVetsPanel';

const trustBadges = [
  { icon: Star, label: 'Trusted vets', desc: '200+ verified professionals', color: 'text-yellow-500' },
  { icon: Shield, label: 'Secure & private', desc: '256-bit encrypted sessions', color: 'text-green-500' },
  { icon: Globe, label: 'For every pet', desc: 'All species welcome', color: 'text-blue-500' },
];

const comparisonRows = [
  { feature: 'Availability', urgent: '24/7 instant', regular: 'Scheduled slots' },
  { feature: 'Wait time', urgent: '2–5 minutes', regular: 'Same day to 48h' },
  { feature: 'Vet selection', urgent: 'First available', regular: 'Choose your vet' },
  { feature: 'Session mode', urgent: 'Video & Chat', regular: 'Video & Chat' },
  { feature: 'Duration', urgent: 'Up to 30 min', regular: '30–60 min' },
  { feature: 'Cost', urgent: 'From ৳1,200', regular: 'From ৳600' },
  { feature: 'Payment timing', urgent: 'After vet accepts', regular: 'Before session' },
  { feature: 'Best for', urgent: 'Emergencies', regular: 'Routine / complex cases' },
];

export default function VetConsultancyPage() {
  return (
    <div className="px-4 lg:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero section */}
        <div className="bg-gradient-to-br from-primary-50 via-orange-50 to-white border border-primary-100 rounded-2xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wide">
                  Vet Consultancy
                </span>
                <span className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  12 vets online
                </span>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
                Get vet help{' '}
                <span className="text-primary">online</span>
              </h1>
              <p className="text-gray-600 text-lg mb-6 max-w-lg">
                Connect with certified veterinarians instantly for urgent care or book a scheduled session — from the comfort of your home.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4">
                {trustBadges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div key={badge.label} className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
                        <Icon size={16} className={badge.color} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{badge.label}</p>
                        <p className="text-xs text-gray-500">{badge.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pet illustration placeholder */}
            <div className="hidden lg:flex w-64 h-48 bg-gradient-to-br from-primary-100 to-orange-100 rounded-2xl items-center justify-center shrink-0">
              <div className="text-center">
                <PawPrint size={56} className="text-primary mb-2 mx-auto" />
                <p className="text-primary font-semibold text-sm">Your pet deserves</p>
                <p className="text-primary font-bold">the best care</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main layout: consultation cards + right panel */}
        <div className="flex gap-6">
          {/* Left: consultation cards */}
          <div className="flex-1 min-w-0">
            {/* Consultation type cards */}
            <div className="grid md:grid-cols-2 gap-5 mb-8">
              <UrgentCard />
              <RegularCard />
            </div>

            {/* Comparison table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg">
                  Urgent vs Regular — which is right for you?
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Both options connect you with verified veterinarians, just at different speeds.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Feature
                      </th>
                      <th className="text-center px-5 py-3">
                        <span className="flex items-center justify-center gap-1.5 text-primary font-bold text-sm">
                          <Zap size={14} />
                          Urgent
                        </span>
                      </th>
                      <th className="text-center px-5 py-3">
                        <span className="flex items-center justify-center gap-1.5 text-vet-green font-bold text-sm">
                          <Calendar size={14} />
                          Regular
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {comparisonRows.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium text-gray-700">
                          {row.feature}
                        </td>
                        <td className="px-5 py-3 text-sm text-center text-gray-600">
                          {row.urgent}
                        </td>
                        <td className="px-5 py-3 text-sm text-center text-gray-600">
                          {row.regular}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-5 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/vet-consultancy/urgent"
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Zap size={16} />
                    Start urgent request
                  </Link>
                  <Link
                    href="/vet-consultancy/browse"
                    className="flex items-center gap-2 px-5 py-2.5 bg-vet-green text-white text-sm font-bold rounded-lg hover:bg-vet-green-600 transition-colors"
                  >
                    <Calendar size={16} />
                    Book consultation
                  </Link>
                </div>
              </div>
            </div>

            {/* What's included */}
            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Building2,
                  title: 'All included',
                  points: ['Live video/chat session', 'Digital prescription', 'Follow-up notes', 'Session recording'],
                },
                {
                  icon: Lock,
                  title: 'Safe & secure',
                  points: ['Verified vets only', 'Encrypted sessions', 'HIPAA compliant', '100% private'],
                },
                {
                  icon: Star,
                  title: 'Quality assured',
                  points: ['4.8+ average rating', 'Post-session review', '5-min response time', 'Money-back guarantee'],
                },
              ].map((card) => {
                const CardIcon = card.icon;
                return (
                <div key={card.title} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="mb-2"><CardIcon size={32} className="text-primary" /></div>
                  <h3 className="font-bold text-gray-900 mb-3">{card.title}</h3>
                  <ul className="space-y-1.5">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check size={13} className="text-green-500 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                );
              })}
            </div>
          </div>

          {/* Right: Online vets panel */}
          <div className="hidden xl:block">
            <OnlineVetsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
