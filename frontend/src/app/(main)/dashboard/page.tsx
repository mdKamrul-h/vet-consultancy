'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Zap,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  Video,
  MessageCircle,
  ChevronRight,
  PawPrint,
  TrendingUp,
  AlertCircle,
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
    symptoms: 'Vomiting and lethargy since morning',
    urgencyLevel: 'high',
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
  },
  {
    id: 'c2',
    type: 'regular',
    mode: 'video',
    status: 'pending',
    petId: 'p1',
    ownerId: 'u1',
    symptoms: 'Annual wellness check',
    urgencyLevel: 'low',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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
  },
];

const statusConfig = {
  pending: { label: 'Upcoming', color: 'bg-yellow-50 text-yellow-700', icon: Clock },
  payment_confirmed: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700', icon: CheckCircle },
  vets_notified: { label: 'Searching', color: 'bg-orange-50 text-orange-700', icon: Clock },
  vet_accepted: { label: 'Accepted', color: 'bg-green-50 text-green-700', icon: CheckCircle },
  active: { label: 'Active', color: 'bg-green-50 text-green-700', icon: Video },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-600', icon: AlertCircle },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>(mockConsultations);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoading(true);
        const res = await consultationApi.list();
        if (res.data?.data) {
          setConsultations(res.data.data);
        }
      } catch {
        // Use mock data
      } finally {
        setLoading(false);
      }
    };
    fetchConsultations();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total consultations', value: '12', icon: Video, color: 'text-primary', bg: 'bg-primary-50' },
          { label: 'Upcoming sessions', value: '1', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Vets consulted', value: '5', icon: Users, color: 'text-vet-green', bg: 'bg-vet-green-50' },
          { label: 'Hours saved', value: '8h', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon size={18} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Urgent consult */}
          <Link
            href="/vet-consultancy/urgent"
            className="group bg-gradient-to-br from-primary to-orange-600 rounded-xl p-5 text-white hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <ChevronRight size={18} className="opacity-70 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-bold text-lg">Urgent Consult</h3>
            <p className="text-orange-100 text-sm mt-1">Connect immediately with available vet</p>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <span className="text-xs text-orange-100">12 vets online now</span>
            </div>
          </Link>

          {/* Book consult */}
          <Link
            href="/vet-consultancy/browse"
            className="group bg-gradient-to-br from-vet-green to-green-700 rounded-xl p-5 text-white hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-white" />
              </div>
              <ChevronRight size={18} className="opacity-70 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-bold text-lg">Book Consult</h3>
            <p className="text-green-100 text-sm mt-1">Schedule with your preferred vet</p>
            <div className="mt-3">
              <span className="text-xs text-green-100">From ৳600 per session</span>
            </div>
          </Link>

          {/* Community */}
          <Link
            href="/community"
            className="group bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-5 text-white hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <ChevronRight size={18} className="opacity-70 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-bold text-lg">Community</h3>
            <p className="text-purple-100 text-sm mt-1">Share & learn from pet lovers</p>
            <div className="mt-3">
              <span className="text-xs text-purple-100">2,400+ members</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent consultations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent consultations</h2>
          <Link
            href="/consultations"
            className="text-sm text-primary font-medium hover:underline"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : consultations.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <PawPrint size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No consultations yet</p>
            <Link
              href="/vet-consultancy"
              className="inline-block mt-3 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600"
            >
              Book your first consultation
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {consultations.map((consult) => {
              const statusInfo = statusConfig[consult.status];
              const StatusIcon = statusInfo.icon;
              const isUpcoming =
                consult.status === 'pending' && consult.scheduledAt;
              const scheduledDate = isUpcoming ? new Date(consult.scheduledAt!) : null;

              return (
                <Link
                  key={consult.id}
                  href={`/consultations/${consult.id}`}
                  className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  {/* Type icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      consult.type === 'urgent' ? 'bg-primary-50' : 'bg-vet-green-50'
                    }`}
                  >
                    {consult.mode === 'video' ? (
                      <Video
                        size={18}
                        className={consult.type === 'urgent' ? 'text-primary' : 'text-vet-green'}
                      />
                    ) : (
                      <MessageCircle
                        size={18}
                        className={consult.type === 'urgent' ? 'text-primary' : 'text-vet-green'}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {consult.vet?.name || 'Finding vet...'}
                        </p>
                        <p className="text-sm text-gray-500">{consult.vet?.specialty}</p>
                      </div>
                      <span
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${statusInfo.color}`}
                      >
                        <StatusIcon size={11} />
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">{consult.symptoms}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      {scheduledDate ? (
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                          <Calendar size={11} />
                          {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span>
                          {new Date(consult.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      <span>·</span>
                      <span>৳{consult.totalAmount}</span>
                      <span>·</span>
                      <span className={`capitalize ${consult.type === 'urgent' ? 'text-primary' : 'text-vet-green'}`}>
                        {consult.type}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
