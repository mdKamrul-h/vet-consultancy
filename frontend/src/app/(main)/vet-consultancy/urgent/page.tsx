'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, AlertTriangle, ChevronLeft, PawPrint, Video, MessageCircle, Plus } from 'lucide-react';
import { urgentApi, petApi } from '@/lib/api';
import { Pet, UrgencyLevel } from '@/types';

const mockPets: Pet[] = [
  {
    id: 'p1',
    ownerId: 'u1',
    name: 'Max',
    species: 'Dog',
    breed: 'Labrador',
    age: 3,
    ageUnit: 'years',
    gender: 'male',
    weight: 25,
  },
  {
    id: 'p2',
    ownerId: 'u1',
    name: 'Luna',
    species: 'Cat',
    breed: 'Indie',
    age: 2,
    ageUnit: 'years',
    gender: 'female',
  },
];

const urgencyLevels: { value: UrgencyLevel; label: string; desc: string; color: string; bg: string }[] = [
  { value: 'low', label: 'Low', desc: 'Non-urgent concern', color: 'text-green-600', bg: 'border-green-200 bg-green-50' },
  { value: 'medium', label: 'Medium', desc: 'Needs attention soon', color: 'text-yellow-700', bg: 'border-yellow-200 bg-yellow-50' },
  { value: 'high', label: 'High', desc: 'Urgent — please hurry', color: 'text-orange-600', bg: 'border-orange-200 bg-orange-50' },
  { value: 'critical', label: 'Critical', desc: 'Life-threatening emergency', color: 'text-red-600', bg: 'border-red-200 bg-red-50' },
];

export default function UrgentConsultPage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>(mockPets);
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [symptoms, setSymptoms] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('high');
  const [mode, setMode] = useState<'video' | 'chat'>('video');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await petApi.list();
        const pets = res.data?.data?.pets ?? res.data?.data;
        if (Array.isArray(pets) && pets.length > 0) {
          setPets(pets);
        }
      } catch {
        // fall through to mockPets
      }
    };
    fetchPets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) {
      setError('Please select your pet');
      return;
    }
    if (!symptoms.trim() || symptoms.length < 10) {
      setError('Please describe the symptoms in more detail (at least 10 characters)');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Step 1: create the consultation
      const consultRes = await urgentApi.createConsultation({
        petId: selectedPet,
        symptoms,
        urgencyLevel: urgencyLevel.toUpperCase(),
        consultMode: mode.toUpperCase(),
        type: 'URGENT',
        consultationFee: 1200,
      });
      const consultationId = consultRes.data?.data?.consultation?.id;

      // Step 2: start urgent matching
      const urgentRes = await urgentApi.startMatching(consultationId);
      const requestId = urgentRes.data?.data?.requestId || 'req_' + Date.now();
      router.push(`/vet-consultancy/urgent/${requestId}`);
    } catch (err) {
      // Demo fallback — still navigate to the progress screen
      const requestId = 'req_demo_' + Date.now();
      router.push(`/vet-consultancy/urgent/${requestId}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft size={16} />
        Back to Vet Consultancy
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Urgent Consultation Request</h1>
            <p className="text-orange-100 text-sm">Describe the issue and we&apos;ll find a vet immediately</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">
            <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
            12 vets online now
          </span>
          <span className="text-xs text-orange-100">Avg. wait: 2–5 minutes</span>
        </div>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">For life-threatening emergencies</p>
          <p className="text-xs text-amber-700 mt-0.5">
            If your pet is unconscious, not breathing, or experiencing a seizure, please also contact your nearest emergency animal clinic immediately.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Select pet */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PawPrint size={18} className="text-primary" />
            Which pet needs help?
          </h2>

          {pets.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-3">No pets added yet</p>
              <button
                type="button"
                className="flex items-center gap-2 mx-auto px-4 py-2 border border-primary text-primary text-sm font-semibold rounded-lg hover:bg-primary-50"
              >
                <Plus size={16} />
                Add a pet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  type="button"
                  onClick={() => setSelectedPet(pet.id)}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    selectedPet === pet.id
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <PawPrint size={16} className="text-primary" />
                  </div>
                  <p className={`font-semibold text-sm ${selectedPet === pet.id ? 'text-primary' : 'text-gray-900'}`}>
                    {pet.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {pet.age ? `${pet.age}yr` : ''}{pet.age ? ' · ' : ''}{(pet.sex ?? pet.gender ?? '').toLowerCase()} · {pet.breed || pet.species?.toLowerCase()}
                  </p>
                </button>
              ))}

              <button
                type="button"
                className="p-4 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary-50 transition-all text-gray-400 hover:text-primary"
              >
                <Plus size={24} />
                <span className="text-xs font-medium">Add pet</span>
              </button>
            </div>
          )}
        </div>

        {/* Urgency level */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-primary" />
            Urgency level
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {urgencyLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setUrgencyLevel(level.value)}
                className={`p-3.5 border-2 rounded-xl text-left transition-all ${
                  urgencyLevel === level.value ? level.bg + ' border-2' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`text-sm font-bold ${urgencyLevel === level.value ? level.color : 'text-gray-800'}`}>
                  {level.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{level.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Describe symptoms */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-bold text-gray-900 mb-2">Describe the symptoms</h2>
          <p className="text-sm text-gray-500 mb-3">
            Be as specific as possible — onset, duration, behavior changes, etc.
          </p>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. My cat has been vomiting since this morning, not eating, and is hiding under the bed. She seems lethargic and her nose is warm..."
            rows={5}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            required
          />
          <p className="text-xs text-gray-400 mt-1.5">{symptoms.length} characters</p>
        </div>

        {/* Consultation mode */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-bold text-gray-900 mb-4">Preferred consultation mode</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('video')}
              className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-all ${
                mode === 'video'
                  ? 'border-primary bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Video size={20} className={mode === 'video' ? 'text-primary' : 'text-gray-400'} />
              <div className="text-left">
                <p className={`text-sm font-bold ${mode === 'video' ? 'text-primary' : 'text-gray-800'}`}>
                  Video call
                </p>
                <p className="text-xs text-gray-500">See the vet live</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('chat')}
              className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-all ${
                mode === 'chat'
                  ? 'border-primary bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <MessageCircle size={20} className={mode === 'chat' ? 'text-primary' : 'text-gray-400'} />
              <div className="text-left">
                <p className={`text-sm font-bold ${mode === 'chat' ? 'text-primary' : 'text-gray-800'}`}>
                  Text chat
                </p>
                <p className="text-xs text-gray-500">Type and share photos</p>
              </div>
            </button>
          </div>
        </div>

        {/* Fee info */}
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Urgent consultation fee</p>
            <p className="text-xs text-gray-500 mt-0.5">Charged only after a vet accepts your request</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">৳1,200</p>
            <p className="text-xs text-gray-500">+ ৳50 platform fee</p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-bold text-base rounded-xl hover:bg-primary-600 disabled:opacity-60 transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Searching for vets...
            </>
          ) : (
            <>
              <Zap size={20} />
              Start urgent request
            </>
          )}
        </button>
      </form>
    </div>
  );
}
