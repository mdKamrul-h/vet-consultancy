import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { isDemoMode } from './demo';
import {
  demoAuthApi,
  demoConsultationApi,
  demoPaymentApi,
  demoPetApi,
  demoUrgentApi,
  demoVetApi,
} from './demoApi';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pawpet_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (!isDemoMode && error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pawpet_token');
        localStorage.removeItem('pawpet_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (email: string, password: string) =>
    isDemoMode ? demoAuthApi.login(email, password) : api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; role: string }) =>
    isDemoMode ? demoAuthApi.register(data) : api.post('/auth/register', data),
  me: () => (isDemoMode ? demoAuthApi.me() : api.get('/auth/me')),
  logout: () => (isDemoMode ? demoAuthApi.logout() : api.post('/auth/logout')),
};

export const vetApi = {
  list: (params?: { online?: boolean; specialty?: string; page?: number; limit?: number }) =>
    isDemoMode ? demoVetApi.list(params) : api.get('/vets', { params }),
  getById: (id: string) => (isDemoMode ? demoVetApi.getById(id) : api.get(`/vets/${id}`)),
  getOnline: () => (isDemoMode ? demoVetApi.getOnline() : api.get('/vets/online')),
};

export const consultationApi = {
  create: (data: {
    type: string;
    mode: string;
    petId: string;
    symptoms: string;
    urgencyLevel: string;
    vetId?: string;
    scheduledAt?: string;
  }) => (isDemoMode ? demoConsultationApi.create() : api.post('/consultations', data)),
  list: () => (isDemoMode ? demoConsultationApi.list() : api.get('/consultations')),
  getById: (id: string) =>
    isDemoMode ? demoConsultationApi.getById(id) : api.get(`/consultations/${id}`),
  startSession: (id: string) =>
    isDemoMode ? demoConsultationApi.startSession(id) : api.post(`/consultations/${id}/start`),
  endSession: (id: string) =>
    isDemoMode ? demoConsultationApi.endSession(id) : api.post(`/consultations/${id}/end`),
};

export const urgentApi = {
  createConsultation: (data: {
    petId: string;
    symptoms: string;
    urgencyLevel: string;
    consultMode: string;
    type: string;
    consultationFee: number;
  }) => (isDemoMode ? demoUrgentApi.createConsultation() : api.post('/consultations', data)),
  startMatching: (consultationId: string) =>
    isDemoMode ? demoUrgentApi.startMatching(consultationId) : api.post('/urgent/request', { consultationId }),
  getStatus: (requestId: string) =>
    isDemoMode ? demoUrgentApi.getStatus(requestId) : api.get(`/urgent/${requestId}/status`),
  acceptRequest: (requestId: string) =>
    isDemoMode ? demoUrgentApi.acceptRequest(requestId) : api.post(`/urgent/${requestId}/accept`),
};

export const paymentApi = {
  initiate: (data: { consultationId: string; method: string; promoCode?: string }) =>
    isDemoMode ? demoPaymentApi.initiate(data) : api.post('/payments/initiate', data),
  verify: (paymentId: string) =>
    isDemoMode ? demoPaymentApi.verify(paymentId) : api.get(`/payments/${paymentId}/verify`),
  getByConsultation: (consultationId: string) =>
    isDemoMode
      ? demoPaymentApi.getByConsultation(consultationId)
      : api.get(`/payments/consultation/${consultationId}`),
};

export const communityApi = {
  getPosts: (params?: { category?: string; type?: string; page?: number }) =>
    api.get('/community/posts', { params }),
  createPost: (data: {
    title: string;
    content: string;
    category: string;
    postType: string;
    images?: string[];
  }) => api.post('/community/posts', data),
  likePost: (postId: string) => api.post(`/community/posts/${postId}/like`),
  getCategoryCounts: () => api.get('/community/category-counts'),
};

export const petApi = {
  list: () => (isDemoMode ? demoPetApi.list() : api.get('/pets')),
  create: (data: {
    name: string;
    species: string;
    breed?: string;
    age: number;
    ageUnit: string;
    gender: string;
    weight?: number;
  }) => (isDemoMode ? demoPetApi.create(data) : api.post('/pets', data)),
  update: (
    id: string,
    data: Partial<{ name: string; breed: string; age: number; weight: number }>
  ) => (isDemoMode ? demoPetApi.update(id, data) : api.put(`/pets/${id}`, data)),
  delete: (id: string) => (isDemoMode ? demoPetApi.delete(id) : api.delete(`/pets/${id}`)),
};
