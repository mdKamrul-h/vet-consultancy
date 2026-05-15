'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Video,
  MessageCircle,
  Send,
  ChevronLeft,
  Paperclip,
  Star,
  CheckCircle,
  Clock,
  Calendar,
  Download,
  Phone,
} from 'lucide-react';
import { JitsiMeet } from '@/components/consultation/JitsiMeet';
import { Consultation } from '@/types';
import { consultationApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'owner' | 'vet';
  content: string;
  timestamp: string;
  type: 'text' | 'image';
}

const mockConsultation: Consultation = {
  id: 'c1',
  type: 'urgent',
  mode: 'video',
  status: 'active',
  petId: 'p1',
  ownerId: 'u1',
  symptoms: 'Vomiting and lethargy since morning, not eating for 12 hours',
  urgencyLevel: 'high',
  startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  roomName: 'pawpet-urgent-req_demo_123',
  fee: 1200,
  platformFee: 50,
  discount: 0,
  totalAmount: 1250,
  createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  vet: {
    id: 'v1',
    userId: 'uv1',
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
    weight: 4,
  },
};

const mockMessages: ChatMessage[] = [
  {
    id: 'm1',
    senderId: 'v1',
    senderName: 'Dr. Aisha Rahman',
    senderRole: 'vet',
    content: 'Hello! I can see your concern about Luna. Can you describe when exactly the vomiting started?',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    type: 'text',
  },
  {
    id: 'm2',
    senderId: 'u1',
    senderName: 'Pet Owner',
    senderRole: 'owner',
    content: 'She vomited 3 times since this morning around 7 AM. She has not eaten anything and is just lying in one place.',
    timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    type: 'text',
  },
  {
    id: 'm3',
    senderId: 'v1',
    senderName: 'Dr. Aisha Rahman',
    senderRole: 'vet',
    content: 'I see. Has she had any access to anything unusual — plants, food scraps, or foreign objects she might have chewed on?',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    type: 'text',
  },
];

export default function ConsultationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [consultation, setConsultation] = useState<Consultation>(mockConsultation);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'video' | 'chat' | 'notes'>('video');
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await consultationApi.getById(id);
        if (res.data?.data) setConsultation(res.data.data);
      } catch {
        // Use mock
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: 'm' + Date.now(),
      senderId: user?.id || 'u1',
      senderName: user?.name || 'Pet Owner',
      senderRole: 'owner',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');

    // Simulate vet response
    setTimeout(() => {
      const vetReply: ChatMessage = {
        id: 'm' + (Date.now() + 1),
        senderId: 'v1',
        senderName: 'Dr. Aisha Rahman',
        senderRole: 'vet',
        content: 'Thank you for that information. Based on what you\'re describing, this could be a gastrointestinal issue. I\'d recommend keeping Luna away from food for the next few hours.',
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      setMessages((prev) => [...prev, vetReply]);
    }, 2000);
  };

  const isActive = consultation.status === 'active';
  const isCompleted = consultation.status === 'completed';
  const roomName = consultation.roomName || `pawpet-${id}`;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-3 bg-white border-b border-gray-200 shrink-0">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-orange-100 flex items-center justify-center text-primary font-bold text-sm">
              AR
            </div>
            {consultation.vet?.isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{consultation.vet?.name}</p>
            <p className="text-xs text-gray-500">{consultation.vet?.specialty}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isActive && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live session
            </span>
          )}
          {isCompleted && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
              <CheckCircle size={11} />
              Completed
            </span>
          )}

          {isCompleted && !showReview && (
            <button
              onClick={() => setShowReview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-semibold rounded-lg hover:bg-yellow-100"
            >
              <Star size={12} />
              Leave review
            </button>
          )}

          <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white shrink-0">
        {[
          { id: 'video' as const, label: 'Video', icon: Video },
          { id: 'chat' as const, label: 'Chat', icon: MessageCircle },
          { id: 'notes' as const, label: 'Notes & Rx', icon: CheckCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* Video tab */}
        {activeTab === 'video' && (
          <div className="h-full p-4">
            {isActive ? (
              <JitsiMeet
                roomName={roomName}
                displayName={user?.name}
                email={user?.email}
                className="h-full min-h-96"
                onReadyToClose={() => router.push('/consultations')}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video size={36} className="text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-700 text-lg">
                    {isCompleted ? 'Session ended' : 'Session not started yet'}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {isCompleted
                      ? 'This consultation has been completed.'
                      : 'The video session will appear here once started.'}
                  </p>
                  {isCompleted && consultation.startedAt && consultation.endedAt && (
                    <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(consultation.startedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {Math.round((new Date(consultation.endedAt).getTime() - new Date(consultation.startedAt).getTime()) / 60000)} min
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat tab */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.senderRole === 'owner';
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {!isOwn && (
                        <p className="text-xs text-gray-500 px-1">{msg.senderName}</p>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm ${
                          isOwn
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <p className="text-xs text-gray-400 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Paperclip size={18} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  disabled={isCompleted}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isCompleted}
                  className="p-2 bg-primary text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes tab */}
        {activeTab === 'notes' && (
          <div className="p-5 overflow-y-auto h-full">
            <div className="max-w-2xl space-y-5">
              {/* Consultation info */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-4">Consultation summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Pet', value: `${consultation.pet?.name} (${consultation.pet?.species})` },
                    { label: 'Issue', value: consultation.symptoms },
                    { label: 'Urgency', value: consultation.urgencyLevel },
                    { label: 'Mode', value: `${consultation.mode} consultation` },
                    { label: 'Date', value: new Date(consultation.createdAt).toLocaleDateString() },
                    { label: 'Fee paid', value: `৳${consultation.totalAmount}` },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5 capitalize">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prescription placeholder */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-2">Prescription & Recommendations</h3>
                {isCompleted ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Diagnosis</p>
                      <p className="text-sm text-blue-800">Mild gastroenteritis - likely due to dietary indiscretion</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-semibold text-green-900 mb-2">Medications</p>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Metronidazole 10mg/kg twice daily for 5 days</li>
                        <li>• Probiotic supplement once daily</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-semibold text-yellow-900 mb-2">Instructions</p>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• Fast for 12-24 hours, then offer bland food (chicken & rice)</li>
                        <li>• Ensure fresh water is always available</li>
                        <li>• Monitor for worsening symptoms</li>
                        <li>• Follow up in 3 days if not improving</li>
                      </ul>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                      <Download size={16} />
                      Download prescription PDF
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Prescription and recommendations will appear here once the consultation is completed.
                  </p>
                )}
              </div>

              {/* Review form */}
              {isCompleted && showReview && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Rate your consultation</h3>
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          size={28}
                          className={`transition-colors ${
                            star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with Dr. Aisha Rahman..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none mb-3"
                  />
                  <button
                    onClick={() => setShowReview(false)}
                    className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Submit review
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active session footer */}
      {isActive && (
        <div className="border-t border-gray-200 bg-white p-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>Session in progress</span>
            <span className="font-mono font-bold text-gray-900">
              {Math.floor((Date.now() - new Date(consultation.startedAt || Date.now()).getTime()) / 60000)}:
              {String(Math.floor((Date.now() - new Date(consultation.startedAt || Date.now()).getTime()) / 1000) % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200">
              <Phone size={14} />
              Switch to call
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700">
              End session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
