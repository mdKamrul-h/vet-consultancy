'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  Video,
  MessageCircle,
  Star,
  Wifi,
  ChevronLeft,
  PawPrint,
  Clock,
} from 'lucide-react';
import { VetCard } from '@/components/vet/VetCard';
import { Vet } from '@/types';
import { vetApi } from '@/lib/api';

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
    bio: 'Specialized in cats, dogs, and small mammals. 8 years of clinical experience.',
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
    bio: 'General practice vet with expertise in internal medicine and preventive care.',
  },
  {
    id: 'v3',
    userId: 'u3',
    name: 'Dr. Mitu Saha',
    specialty: 'Exotic & Wildlife Animals',
    degree: 'DVM',
    experience: 6,
    rating: 4.8,
    reviewCount: 189,
    isOnline: false,
    responseTime: '~3 min',
    languages: ['Bengali'],
    consultationFee: 750,
    urgentFee: 1100,
    isVerified: true,
    consultationTypes: ['chat'],
    bio: 'Expert in birds, reptiles, and exotic animals. Available for online consultations.',
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
    bio: 'Senior veterinary surgeon with 12 years in emergency and critical care medicine.',
  },
  {
    id: 'v5',
    userId: 'u5',
    name: 'Dr. Priya Chakraborty',
    specialty: 'Dermatology & Allergies',
    degree: 'DVM, Cert. Dermatology',
    experience: 7,
    rating: 4.6,
    reviewCount: 143,
    isOnline: true,
    responseTime: '~4 min',
    languages: ['Bengali', 'Hindi', 'English'],
    consultationFee: 850,
    urgentFee: 1300,
    isVerified: true,
    consultationTypes: ['video', 'chat'],
    bio: 'Specialized in skin conditions, allergies, and dermatological disorders in pets.',
  },
  {
    id: 'v6',
    userId: 'u6',
    name: 'Dr. Karim Hossain',
    specialty: 'Nutrition & Internal Medicine',
    degree: 'DVM, MVSc Nutrition',
    experience: 9,
    rating: 4.8,
    reviewCount: 201,
    isOnline: false,
    responseTime: '~6 min',
    languages: ['Bengali'],
    consultationFee: 700,
    urgentFee: 1100,
    isVerified: true,
    consultationTypes: ['video', 'chat'],
    bio: 'Expert in pet nutrition, weight management, and gastrointestinal disorders.',
  },
];

type FilterType = 'all' | 'online' | 'top_rated' | 'lowest_fee' | 'video' | 'chat';

const howItWorksSteps = [
  { step: 1, label: 'Share your request', icon: PawPrint },
  { step: 2, label: 'Browse verified vets', icon: Search },
  { step: 3, label: 'Choose & schedule', icon: Clock },
  { step: 4, label: 'Pay & start session', icon: Video },
];

export default function BrowseVetsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vets, setVets] = useState<Vet[]>(mockVets);
  const [filteredVets, setFilteredVets] = useState<Vet[]>(mockVets);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVets = async () => {
      try {
        setLoading(true);
        const res = await vetApi.list();
        const raw: Array<{
          id: string;
          name: string;
          vetProfile?: {
            specialty?: string;
            experienceYears?: number;
            rating?: number;
            reviewsCount?: number;
            languages?: string[];
            consultationFee?: number;
            urgentFee?: number;
            responseTimeMinutes?: number;
            isOnline?: boolean;
            isVerified?: boolean;
            bio?: string;
            qualifications?: string[];
          };
        }> = res.data?.data?.vets ?? res.data?.data ?? [];
        if (Array.isArray(raw) && raw.length > 0) {
          const normalized: Vet[] = raw.map((u) => {
            const p = u.vetProfile ?? {};
            return {
              id: u.id,
              userId: u.id,
              name: u.name,
              specialty: p.specialty ?? 'General Veterinarian',
              degree: p.qualifications?.[0]?.split(' - ')[0] ?? 'DVM',
              experience: p.experienceYears ?? 0,
              rating: p.rating ?? 5.0,
              reviewCount: p.reviewsCount ?? 0,
              isOnline: p.isOnline ?? false,
              responseTime: p.responseTimeMinutes ? `~${p.responseTimeMinutes} min` : '~5 min',
              languages: p.languages ?? ['English'],
              consultationFee: p.consultationFee ?? 500,
              urgentFee: p.urgentFee ?? 1000,
              isVerified: p.isVerified ?? true,
              consultationTypes: ['video', 'chat'],
              bio: p.bio,
            };
          });
          setVets(normalized);
          setFilteredVets(normalized);
        }
      } catch {
        // Use mock data
      } finally {
        setLoading(false);
      }
    };
    fetchVets();
  }, []);

  useEffect(() => {
    let result = [...vets];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.specialty.toLowerCase().includes(q) ||
          v.languages.some((l) => l.toLowerCase().includes(q))
      );
    }

    // Category filters
    switch (activeFilter) {
      case 'online':
        result = result.filter((v) => v.isOnline);
        break;
      case 'top_rated':
        result = result.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest_fee':
        result = result.sort((a, b) => a.consultationFee - b.consultationFee);
        break;
      case 'video':
        result = result.filter((v) => v.consultationTypes.includes('video'));
        break;
      case 'chat':
        result = result.filter((v) => v.consultationTypes.includes('chat'));
        break;
    }

    setFilteredVets(result);
  }, [vets, activeFilter, searchQuery]);

  const handleChooseVet = (vet: Vet) => {
    // Navigate to payment with a temp consultation ID
    const consultId = `temp_${vet.id}_${Date.now()}`;
    router.push(`/vet-consultancy/payment/${consultId}?vetId=${vet.id}`);
  };

  const filters: { id: FilterType; label: string; icon?: React.ReactNode }[] = [
    { id: 'all', label: 'All vets' },
    { id: 'online', label: 'Online now', icon: <Wifi size={13} /> },
    { id: 'top_rated', label: 'Top rated', icon: <Star size={13} /> },
    { id: 'lowest_fee', label: 'Lowest fee' },
    { id: 'video', label: 'Video consult', icon: <Video size={13} /> },
    { id: 'chat', label: 'Chat consult', icon: <MessageCircle size={13} /> },
  ];

  const onlineCount = filteredVets.filter((v) => v.isOnline).length;

  return (
    <div className="px-4 lg:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {/* Hero */}
        <div className="bg-gradient-to-br from-vet-green-50 to-green-50 border border-vet-green-100 rounded-2xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Choose a vet for your online consultation
          </h1>
          <p className="text-gray-600">
            Browse our network of {vets.length} verified veterinarians — filter by specialty, availability, or fee.
          </p>
        </div>

        {/* Request summary bar */}
        {searchParams.get('pet') && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500">Your request:</span>
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              🐱 Cat · Luna
            </span>
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              Vomiting · lethargy
            </span>
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              Anytime today
            </span>
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              Video preferred
            </span>
            <button className="ml-auto text-xs text-primary hover:underline">Edit request</button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Left: vet list */}
          <div className="flex-1 min-w-0">
            {/* Search + filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
              {/* Search */}
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, specialty, or language..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Filter chips */}
              <div className="flex overflow-x-auto pb-2 gap-2 -mx-4 px-4 snap-x scrollbar-hide">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 snap-start ${
                      activeFilter === f.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.icon}
                    {f.label}
                  </button>
                ))}
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all shrink-0 snap-start">
                  <SlidersHorizontal size={13} />
                  More filters
                </button>
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{filteredVets.length}</span> vets found
                {onlineCount > 0 && (
                  <span className="ml-2 text-green-600 font-medium">
                    ({onlineCount} online now)
                  </span>
                )}
              </p>
            </div>

            {/* Vet list */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-3 bg-gray-100 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredVets.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                <Search size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No vets found matching your criteria</p>
                <button
                  onClick={() => {
                    setActiveFilter('all');
                    setSearchQuery('');
                  }}
                  className="mt-3 text-sm text-primary font-medium hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVets.map((vet) => (
                  <VetCard key={vet.id} vet={vet} onChoose={handleChooseVet} />
                ))}
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <div className="hidden xl:block w-72 shrink-0 space-y-4">
            {/* Online vets */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Live online now</h3>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    {vets.filter((v) => v.isOnline).length} online
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {vets
                  .filter((v) => v.isOnline)
                  .slice(0, 4)
                  .map((vet) => (
                    <div key={vet.id} className="p-3 flex items-center gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-orange-100 flex items-center justify-center text-primary font-bold text-sm">
                          {vet.name.split(' ').slice(1).map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{vet.name}</p>
                        <p className="text-xs text-gray-500 truncate">{vet.specialty}</p>
                      </div>
                      <button
                        onClick={() => handleChooseVet(vet)}
                        className="text-xs px-2.5 py-1.5 bg-vet-green text-white font-semibold rounded-lg hover:bg-vet-green-600 transition-colors"
                      >
                        Choose
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* How it works */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">How regular consultation works</h3>
              <div className="space-y-3">
                {howItWorksSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.step} className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-vet-green-50 border border-vet-green-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-vet-green">{step.step}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <Icon size={14} className="text-gray-400 shrink-0" />
                        <p className="text-xs text-gray-600">{step.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
