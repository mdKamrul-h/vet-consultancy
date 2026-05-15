'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Video,
  MessageCircle,
  Clock,
  CheckCircle,
  Calendar,
  ChevronRight,
  Search,
  PawPrint,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Consultation } from '@/types';
import { consultationApi } from '@/lib/api';

const mockConsultations: Consultation[] = [
  {
    id: 'c1',
    type: 'urgent',
    mode: 'video',
    status: 'completed',
    petId: 'p1',
    ownerId: 'u1',
    symptoms: 'Vomiting and lethargy since morning, not eating',
    urgencyLevel: 'high',
    startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString(),
    fee: 1200,
    platformFee: 50,
    discount: 0,
    totalAmount: 1250,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    vet: {
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
    pet: {
      id: 'p1',
      ownerId: 'u1',
      name: 'Luna',
      species: 'Cat',
      breed: 'Indie',
      age: 3,
      ageUnit: 'years',
      gender: 'female',
    },
  },
  {
    id: 'c2',
    type: 'regular',
    mode: 'video',
    status: 'pending',
    petId: 'p2',
    ownerId: 'u1',
    symptoms: 'Annual wellness check and vaccination update',
    urgencyLevel: 'low',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    fee: 800,
    platformFee: 50,
    discount: 100,
    totalAmount: 750,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    vet: {
      id: 'v2',
      userId: 'u2',
      name: 'Dr. Tanvir Ahmed',
      specialty: 'General Veterinarian',
      degree: 'DVM, MVSc',
      experience: 5,
      rating: 4.7,
      reviewCount: 156,
      isOnline: false,
      responseTime: '~5 min',
      languages: ['Bengali', 'English'],
      consultationFee: 600,
      urgentFee: 1000,
      isVerified: true,
      consultationTypes: ['video', 'chat'],
    },
    pet: {
      id: 'p2',
      ownerId: 'u1',
      name: 'Max',
      species: 'Dog',
      breed: 'Labrador',
      age: 3,
      ageUnit: 'years',
      gender: 'male',
    },
  },
  {
    id: 'c3',
    type: 'regular',
    mode: 'chat',
    status: 'completed',
    petId: 'p2',
    ownerId: 'u1',
    symptoms: 'Skin rashes on belly, scratching frequently',
    urgencyLevel: 'medium',
    startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    fee: 850,
    platformFee: 50,
    discount: 0,
    totalAmount: 900,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    vet: {
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
    },
    pet: {
      id: 'p2',
      ownerId: 'u1',
      name: 'Max',
      species: 'Dog',
      breed: 'Labrador',
      age: 3,
      ageUnit: 'years',
      gender: 'male',
    },
  },
];

type FilterTab = 'all' | 'upcoming' | 'completed' | 'urgent';

const statusDisplay = {
  pending: { label: 'Upcoming', color: 'bg-blue-50 text-blue-700', icon: Calendar },
  payment_confirmed: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700', icon: CheckCircle },
  vets_notified: { label: 'Searching vets', color: 'bg-orange-50 text-orange-700', icon: Clock },
  vet_accepted: { label: 'Vet accepted', color: 'bg-green-50 text-green-700', icon: CheckCircle },
  active: { label: 'In progress', color: 'bg-primary-50 text-primary', icon: Video },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-600', icon: AlertCircle },
};

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>(mockConsultations);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await consultationApi.list();
        if (res.data?.data) setConsultations(res.data.data);
      } catch {
        // Use mock data
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = consultations.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      const matchesVet = c.vet?.name.toLowerCase().includes(q);
      const matchesPet = c.pet?.name.toLowerCase().includes(q);
      const matchesSymptom = c.symptoms.toLowerCase().includes(q);
      if (!matchesVet && !matchesPet && !matchesSymptom) return false;
    }

    switch (activeTab) {
      case 'upcoming':
        return ['pending', 'payment_confirmed', 'vet_accepted'].includes(c.status);
      case 'completed':
        return c.status === 'completed';
      case 'urgent':
        return c.type === 'urgent';
      default:
        return true;
    }
  });

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: consultations.length },
    { id: 'upcoming', label: 'Upcoming', count: consultations.filter((c) => ['pending', 'payment_confirmed', 'vet_accepted'].includes(c.status)).length },
    { id: 'completed', label: 'Completed', count: consultations.filter((c) => c.status === 'completed').length },
    { id: 'urgent', label: 'Urgent', count: consultations.filter((c) => c.type === 'urgent').length },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Consultations</h1>
          <p className="text-gray-500 text-sm mt-0.5">View and manage all your vet sessions</p>
        </div>
        <Link
          href="/vet-consultancy"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Zap size={16} />
          New consultation
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by vet, pet, or symptom..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <PawPrint size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No consultations found</p>
          <p className="text-gray-400 text-sm mt-1">
            {search ? 'Try a different search term' : 'Book your first consultation to get started'}
          </p>
          <Link
            href="/vet-consultancy"
            className="inline-block mt-4 px-5 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-600"
          >
            Book consultation
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((consult) => {
            const statusInfo = statusDisplay[consult.status];
            const StatusIcon = statusInfo.icon;
            const isScheduled = consult.status === 'pending' && consult.scheduledAt;
            const isCompleted = consult.status === 'completed';
            const duration = consult.startedAt && consult.endedAt
              ? Math.round((new Date(consult.endedAt).getTime() - new Date(consult.startedAt).getTime()) / 60000)
              : null;

            return (
              <Link
                key={consult.id}
                href={`/consultations/${consult.id}`}
                className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    consult.type === 'urgent' ? 'bg-primary-50' : 'bg-vet-green-50'
                  }`}
                >
                  {consult.mode === 'video' ? (
                    <Video size={20} className={consult.type === 'urgent' ? 'text-primary' : 'text-vet-green'} />
                  ) : (
                    <MessageCircle size={20} className={consult.type === 'urgent' ? 'text-primary' : 'text-vet-green'} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{consult.vet?.name || 'Finding vet...'}</h3>
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                        >
                          <StatusIcon size={10} />
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{consult.vet?.specialty}</p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-300 group-hover:text-primary transition-colors shrink-0 mt-1"
                    />
                  </div>

                  <p className="text-sm text-gray-600 mt-1.5 line-clamp-1">
                    {consult.pet ? `${consult.pet.name} (${consult.pet.species})` : 'Pet'} · {consult.symptoms}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                    {isScheduled ? (
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <Calendar size={11} />
                        {new Date(consult.scheduledAt!).toLocaleDateString()} at{' '}
                        {new Date(consult.scheduledAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span>{new Date(consult.createdAt).toLocaleDateString()}</span>
                    )}
                    <span>·</span>
                    <span className="capitalize">{consult.mode} consultation</span>
                    <span>·</span>
                    <span className={`font-medium ${consult.type === 'urgent' ? 'text-primary' : 'text-vet-green'} capitalize`}>
                      {consult.type}
                    </span>
                    {isCompleted && duration && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {duration} min
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span className="font-medium text-gray-600">৳{consult.totalAmount}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
