// Role comes from backend as PET_OWNER | VET | ADMIN
export type UserRole = 'PET_OWNER' | 'VET' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface Vet {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  specialty: string;
  degree: string;
  experience: number;
  rating: number;
  reviewCount: number;
  isOnline: boolean;
  responseTime: string;
  languages: string[];
  consultationFee: number;
  urgentFee: number;
  isVerified: boolean;
  bio?: string;
  consultationTypes: ('video' | 'chat')[];
}

// Pet fields match backend: sex is MALE|FEMALE, species is DOG|CAT etc (uppercase)
export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  sex?: 'MALE' | 'FEMALE';
  photoUrl?: string;
  medicalHistory?: string;
  // Legacy frontend-only fields (kept for mock data compat)
  ageUnit?: 'months' | 'years';
  gender?: 'male' | 'female';
  weight?: number;
  avatar?: string;
}

export type ConsultationStatus =
  | 'pending'
  | 'payment_confirmed'
  | 'vets_notified'
  | 'vet_accepted'
  | 'active'
  | 'completed'
  | 'cancelled';

export type ConsultationType = 'urgent' | 'regular';
export type ConsultationMode = 'video' | 'chat';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Consultation {
  id: string;
  type: ConsultationType;
  mode: ConsultationMode;
  status: ConsultationStatus;
  petId: string;
  pet?: Pet;
  vetId?: string;
  vet?: Vet;
  ownerId: string;
  symptoms: string;
  urgencyLevel: UrgencyLevel;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  roomName?: string;
  fee: number;
  platformFee: number;
  discount: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
}

export interface UrgentRequest {
  id: string;
  consultationId: string;
  consultation?: Consultation;
  status: 'searching' | 'vet_accepted' | 'ready' | 'expired';
  notifiedVets: UrgentVetStatus[];
  acceptedVetId?: string;
  acceptedVet?: Vet;
  expiresAt: string;
  createdAt: string;
}

export interface UrgentVetStatus {
  vetId: string;
  vet: Vet;
  status: 'notified' | 'reviewing' | 'accepted' | 'declined';
  notifiedAt: string;
  respondedAt?: string;
}

export interface Payment {
  id: string;
  consultationId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'card' | 'bkash' | 'nagad' | 'mobile_banking';
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

export type PostCategory =
  | 'all'
  | 'urgent_rescue'
  | 'lost_found'
  | 'adoption'
  | 'medical_help'
  | 'foster_needed'
  | 'vet_consultancy'
  | 'supplies_donations'
  | 'success_stories';

export type PostType = 'question' | 'update' | 'rescue_alert' | 'advice';

export interface CommunityPost {
  id: string;
  authorId: string;
  author: User;
  title: string;
  content: string;
  category: PostCategory;
  postType: PostType;
  images?: string[];
  likes: number;
  comments: number;
  isLiked?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  consultationId: string;
  vetId: string;
  vet?: Vet;
  ownerId: string;
  owner?: User;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
