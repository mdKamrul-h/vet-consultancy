'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wifi, Users, Activity, Shield, AlertCircle } from 'lucide-react';
import { Vet } from '@/types';
import { vetApi } from '@/lib/api';

const mockVets: Vet[] = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
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

const emergencyTips = [
  'Keep your pet calm and warm',
  'Do not give human medications',
  'Have vet contact info ready',
  'Note symptom onset time',
  'Avoid forcing food or water',
];

export function OnlineVetsPanel() {
  const [vets, setVets] = useState<Vet[]>(mockVets);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOnlineVets = async () => {
      try {
        setLoading(true);
        const res = await vetApi.getOnline();
        if (res.data?.data) {
          setVets(res.data.data);
        }
      } catch {
        // Use mock data
      } finally {
        setLoading(false);
      }
    };
    fetchOnlineVets();
  }, []);

  return (
    <div className="w-72 shrink-0 space-y-4">
      {/* Online Vets Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Online vets now</h3>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              {vets.length} online
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading vets...</div>
          ) : (
            vets.slice(0, 4).map((vet) => (
              <div key={vet.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-orange-100 flex items-center justify-center text-primary font-bold text-sm">
                      {vet.name
                        .split(' ')
                        .slice(1)
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{vet.name}</p>
                    <p className="text-xs text-gray-500 truncate">{vet.specialty}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500 text-xs">★</span>
                      <span className="text-xs text-gray-600">{vet.rating}</span>
                      <span className="text-xs text-gray-400">· {vet.responseTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Link
                    href="/vet-consultancy/urgent"
                    className="flex-1 text-center px-2 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Urgent
                  </Link>
                  <Link
                    href="/vet-consultancy/browse"
                    className="flex-1 text-center px-2 py-1.5 border border-vet-green text-vet-green text-xs font-semibold rounded-lg hover:bg-vet-green-50 transition-colors"
                  >
                    Book
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-gray-100">
          <Link
            href="/vet-consultancy/browse"
            className="block w-full text-center text-sm text-primary font-medium hover:underline"
          >
            View all vets →
          </Link>
        </div>
      </div>

      {/* Emergency Tips */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={18} className="text-red-500" />
          <h3 className="font-semibold text-red-800">Emergency tips</h3>
        </div>
        <ul className="space-y-2">
          {emergencyTips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-red-700">
              <span className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Community Stats */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Community</h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <Users size={18} className="mx-auto text-primary mb-1" />
            <p className="text-sm font-bold text-gray-900">2.4K</p>
            <p className="text-xs text-gray-500">Members</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <Activity size={18} className="mx-auto text-green-500 mb-1" />
            <p className="text-sm font-bold text-gray-900">186</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <Wifi size={18} className="mx-auto text-blue-500 mb-1" />
            <p className="text-sm font-bold text-gray-900">58</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
        <Link
          href="/community"
          className="block w-full text-center px-4 py-2 border border-primary text-primary text-sm font-semibold rounded-lg hover:bg-primary-50 transition-colors"
        >
          Join Community
        </Link>
      </div>

      {/* Trust badges */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} className="text-vet-green" />
          <p className="text-sm font-semibold text-gray-900">Secure & trusted</p>
        </div>
        <p className="text-xs text-gray-500">
          All consultations are private and encrypted. Your pet&apos;s health data is safe with us.
        </p>
      </div>
    </div>
  );
}

export default OnlineVetsPanel;
