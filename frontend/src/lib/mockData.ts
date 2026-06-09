import { Consultation, Pet, User, UserRole, Vet } from '@/types';

const now = Date.now();

export const DEMO_PET_OWNER: User = {
  id: 'u-demo-owner',
  name: 'Mahboob Rabin',
  email: 'mahboob@example.com',
  role: 'PET_OWNER',
  createdAt: new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString(),
};

export const DEMO_VET_USER: User = {
  id: 'u-demo-vet',
  name: 'Dr. Aisha Rahman',
  email: 'aisha.rahman@pawpet.vet',
  role: 'VET',
  createdAt: new Date(now - 120 * 24 * 60 * 60 * 1000).toISOString(),
};

export const DEMO_CREDENTIALS: Record<string, { password: string; user: User }> = {
  'mahboob@example.com': { password: 'password123', user: DEMO_PET_OWNER },
  'aisha.rahman@pawpet.vet': { password: 'password123', user: DEMO_VET_USER },
};

export const MOCK_VETS: Vet[] = [
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
    bio: 'Expert in birds, reptiles, and exotic animals.',
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

export const MOCK_PETS: Pet[] = [
  {
    id: 'p1',
    ownerId: DEMO_PET_OWNER.id,
    name: 'Max',
    species: 'Dog',
    breed: 'Labrador Retriever',
    age: 3,
    ageUnit: 'years',
    gender: 'male',
    weight: 25,
  },
  {
    id: 'p2',
    ownerId: DEMO_PET_OWNER.id,
    name: 'Luna',
    species: 'Cat',
    breed: 'Indian Indie',
    age: 2,
    ageUnit: 'years',
    gender: 'female',
    weight: 4,
  },
];

export const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: 'c1',
    type: 'urgent',
    mode: 'video',
    status: 'completed',
    petId: 'p1',
    ownerId: DEMO_PET_OWNER.id,
    symptoms: 'Vomiting and lethargy since morning',
    urgencyLevel: 'high',
    fee: 1200,
    platformFee: 50,
    discount: 0,
    totalAmount: 1250,
    createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    vet: MOCK_VETS[0],
    pet: MOCK_PETS[1],
  },
  {
    id: 'c2',
    type: 'regular',
    mode: 'video',
    status: 'pending',
    petId: 'p1',
    ownerId: DEMO_PET_OWNER.id,
    symptoms: 'Annual wellness check',
    urgencyLevel: 'low',
    scheduledAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
    fee: 800,
    platformFee: 50,
    discount: 100,
    totalAmount: 750,
    createdAt: new Date(now - 60 * 60 * 1000).toISOString(),
    vet: MOCK_VETS[1],
    pet: MOCK_PETS[0],
  },
];

export function vetToBackendShape(vet: Vet) {
  const minutes = parseInt(vet.responseTime.replace(/\D/g, ''), 10) || 5;
  return {
    id: vet.id,
    name: vet.name,
    vetProfile: {
      specialty: vet.specialty,
      experienceYears: vet.experience,
      rating: vet.rating,
      reviewsCount: vet.reviewCount,
      languages: vet.languages,
      consultationFee: vet.consultationFee,
      urgentFee: vet.urgentFee,
      responseTimeMinutes: minutes,
      isOnline: vet.isOnline,
      isVerified: vet.isVerified,
      bio: vet.bio ?? '',
      qualifications: [`${vet.degree} - Licensed Veterinarian`],
    },
  };
}

export function findVetById(vetId: string) {
  return MOCK_VETS.find((v) => v.id === vetId) ?? MOCK_VETS[0];
}

export function createDemoUser(data: {
  name: string;
  email: string;
  role: string;
}): User {
  return {
    id: `u-demo-${Date.now()}`,
    name: data.name,
    email: data.email,
    role: data.role as UserRole,
    createdAt: new Date().toISOString(),
  };
}
