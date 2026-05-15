'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Check,
  Star,
  Clock,
  Globe,
  Video,
  MessageCircle,
  Zap,
  Shield,
  GraduationCap,
  Calendar,
  ThumbsUp,
} from 'lucide-react';
import { vetApi } from '@/lib/api';

interface VetData {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  vetProfile: {
    specialty: string;
    experienceYears: number;
    rating: number;
    reviewsCount: number;
    languages: string[];
    bio: string;
    consultationFee: number;
    urgentFee: number;
    responseTimeMinutes: number;
    isOnline: boolean;
    isVerified: boolean;
    qualifications: string[];
  };
}

const MOCK_VET: VetData = {
  id: 'v1',
  name: 'Dr. Aisha Rahman',
  vetProfile: {
    specialty: 'Small Animal Medicine',
    experienceYears: 8,
    rating: 4.9,
    reviewsCount: 234,
    languages: ['Bengali', 'English'],
    bio: 'Specialist in small animal internal medicine with a passion for preventive care. Completed advanced training at BAU and University of Edinburgh. I believe every pet deserves compassionate, evidence-based care.',
    consultationFee: 800,
    urgentFee: 1200,
    responseTimeMinutes: 2,
    isOnline: true,
    isVerified: true,
    qualifications: [
      'DVM - Bangladesh Agricultural University',
      'MVSc - Internal Medicine (Edinburgh)',
      'Certificate in Small Animal Medicine - Royal College',
    ],
  },
};

const MOCK_REVIEWS = [
  {
    id: 'r1',
    author: 'Mahboob R.',
    avatar: 'MR',
    rating: 5,
    date: '2 days ago',
    text: 'Dr. Aisha was incredibly thorough and patient. She diagnosed my cat Bruno quickly and the prescribed treatment worked within 3 days. Highly recommend!',
    helpful: 12,
  },
  {
    id: 'r2',
    author: 'Priya S.',
    avatar: 'PS',
    rating: 5,
    date: '1 week ago',
    text: 'Amazing consultation. She explained everything clearly and followed up the next day to check on my dog. This is the level of care I expected.',
    helpful: 8,
  },
  {
    id: 'r3',
    author: 'Karim H.',
    avatar: 'KH',
    rating: 4,
    date: '2 weeks ago',
    text: 'Very knowledgeable vet. The video call was smooth and she answered all my questions about my parrot\'s feather loss. Will book again.',
    helpful: 5,
  },
];

const AVAILABILITY = ['10:00 AM', '11:00 AM', '2:00 PM', '3:30 PM', '5:00 PM'];

export default function VetProfilePage() {
  const params = useParams();
  const router = useRouter();
  const vetId = params.vetId as string;

  const [vet, setVet] = useState<VetData>(MOCK_VET);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');

  useEffect(() => {
    const fetchVet = async () => {
      try {
        const res = await vetApi.getById(vetId);
        const data = res.data?.data?.vet ?? res.data?.data;
        if (data?.vetProfile) setVet(data);
      } catch {
        // use mock
      }
    };
    fetchVet();
  }, [vetId]);

  const initials = vet.name
    .split(' ')
    .slice(1)
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const handleBookNow = () => {
    const consultId = `temp_${vetId}_${Date.now()}`;
    const slot = selectedSlot ? `&slot=${encodeURIComponent(selectedSlot)}` : '';
    router.push(`/vet-consultancy/payment/${consultId}?vetId=${vetId}&vetName=${encodeURIComponent(vet.name)}&fee=${vet.vetProfile.consultationFee}${slot}`);
  };

  const handleUrgent = () => {
    router.push('/vet-consultancy/urgent');
  };

  return (
    <div className="px-4 lg:px-6 py-6 max-w-5xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft size={16} />
        Back to browse
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left / main column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Hero card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex gap-5">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-orange-100 flex items-center justify-center text-primary font-bold text-2xl">
                  {initials}
                </div>
                {vet.vetProfile.isOnline && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{vet.name}</h1>
                  {vet.vetProfile.isVerified && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                      <Check size={11} />
                      Verified
                    </span>
                  )}
                  {vet.vetProfile.isOnline ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 text-xs font-semibold rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Online now
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                      Offline
                    </span>
                  )}
                </div>
                <p className="text-primary font-semibold">{vet.vetProfile.specialty}</p>
                <p className="text-sm text-gray-500">{vet.vetProfile.experienceYears} years experience</p>

                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= Math.floor(vet.vetProfile.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
                      />
                    ))}
                    <span className="text-sm font-bold text-gray-800 ml-1">{vet.vetProfile.rating}</span>
                    <span className="text-sm text-gray-400 ml-0.5">({vet.vetProfile.reviewsCount} reviews)</span>
                  </div>
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock size={14} className="text-gray-400" />
                    Responds in ~{vet.vetProfile.responseTimeMinutes} min
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Globe size={14} className="text-gray-400" />
                    {vet.vetProfile.languages.join(', ')}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  {vet.vetProfile.consultationFee && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                      <Video size={11} />
                      Video ৳{vet.vetProfile.consultationFee}
                    </span>
                  )}
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
                    <MessageCircle size={11} />
                    Chat
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                    <Zap size={11} />
                    Urgent ৳{vet.vetProfile.urgentFee}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex border-b border-gray-100">
              {(['about', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors capitalize ${
                    activeTab === tab
                      ? 'text-primary border-b-2 border-primary bg-primary-50/30'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'reviews' ? `Reviews (${vet.vetProfile.reviewsCount})` : 'About'}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'about' ? (
                <div className="space-y-5">
                  {/* Bio */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">About</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{vet.vetProfile.bio}</p>
                  </div>

                  {/* Qualifications */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <GraduationCap size={16} className="text-primary" />
                      Qualifications
                    </h3>
                    <ul className="space-y-2">
                      {vet.vetProfile.qualifications.map((q, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary-50 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={11} className="text-primary" />
                          </div>
                          <span className="text-sm text-gray-700">{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {[
                      { label: 'Experience', value: `${vet.vetProfile.experienceYears} yrs` },
                      { label: 'Consultations', value: `${vet.vetProfile.reviewsCount * 3}+` },
                      { label: 'Response', value: `~${vet.vetProfile.responseTimeMinutes} min` },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-gray-900">{vet.vetProfile.rating}</p>
                      <div className="flex justify-center mt-1">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={12} className="text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{vet.vetProfile.reviewsCount} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {[5,4,3,2,1].map((star) => {
                        const pct = star === 5 ? 72 : star === 4 ? 20 : star === 3 ? 6 : star === 2 ? 1 : 1;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-2">{star}</span>
                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-6">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {MOCK_REVIEWS.map((review) => (
                    <div key={review.id} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-orange-100 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {review.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">{review.author}</p>
                            <p className="text-xs text-gray-400">{review.date}</p>
                          </div>
                          <div className="flex mt-0.5 mb-1.5">
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} size={11} className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                          <button className="flex items-center gap-1.5 mt-2 text-xs text-gray-400 hover:text-gray-600">
                            <ThumbsUp size={12} />
                            Helpful ({review.helpful})
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: booking sidebar */}
        <div className="space-y-4">
          {/* Fee card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 lg:sticky lg:top-20 space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">৳{vet.vetProfile.consultationFee}</p>
                <p className="text-xs text-gray-500">per consultation session</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-red-500">৳{vet.vetProfile.urgentFee}</p>
                <p className="text-xs text-gray-500">urgent rate</p>
              </div>
            </div>

            {/* Time slot picker */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Calendar size={14} className="text-primary" />
                Available today
              </p>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABILITY.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      selectedSlot === slot
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleBookNow}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors"
            >
              <Video size={18} />
              Book Now · ৳{vet.vetProfile.consultationFee + 50}
            </button>

            <button
              onClick={handleUrgent}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 transition-colors"
            >
              <Zap size={16} />
              Start Urgent Consultation
            </button>

            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              <Shield size={13} className="text-green-500 shrink-0" />
              Full refund if cancelled 1 hour before session
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
