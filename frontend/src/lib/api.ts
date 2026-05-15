import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

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
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
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

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Vet endpoints
export const vetApi = {
  list: (params?: { online?: boolean; specialty?: string; page?: number; limit?: number }) =>
    api.get('/vets', { params }),
  getById: (id: string) => api.get(`/vets/${id}`),
  getOnline: () => api.get('/vets/online'),
};

// Consultation endpoints
export const consultationApi = {
  create: (data: {
    type: string;
    mode: string;
    petId: string;
    symptoms: string;
    urgencyLevel: string;
    vetId?: string;
    scheduledAt?: string;
  }) => api.post('/consultations', data),
  list: () => api.get('/consultations'),
  getById: (id: string) => api.get(`/consultations/${id}`),
  startSession: (id: string) => api.post(`/consultations/${id}/start`),
  endSession: (id: string) => api.post(`/consultations/${id}/end`),
};

// Urgent request endpoints
export const urgentApi = {
  // Step 1: create the consultation record
  createConsultation: (data: {
    petId: string;
    symptoms: string;
    urgencyLevel: string;
    consultMode: string;
    type: string;
    consultationFee: number;
  }) => api.post('/consultations', data),
  // Step 2: start urgent matching (backend notifies all online vets)
  startMatching: (consultationId: string) =>
    api.post('/urgent/request', { consultationId }),
  getStatus: (requestId: string) => api.get(`/urgent/${requestId}/status`),
  acceptRequest: (requestId: string) => api.post(`/urgent/${requestId}/accept`),
};

// Payment endpoints
export const paymentApi = {
  initiate: (data: {
    consultationId: string;
    method: string;
    promoCode?: string;
  }) => api.post('/payments/initiate', data),
  verify: (paymentId: string) => api.get(`/payments/${paymentId}/verify`),
  getByConsultation: (consultationId: string) =>
    api.get(`/payments/consultation/${consultationId}`),
};

// Community endpoints
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

// Pet endpoints
export const petApi = {
  list: () => api.get('/pets'),
  create: (data: {
    name: string;
    species: string;
    breed?: string;
    age: number;
    ageUnit: string;
    gender: string;
    weight?: number;
  }) => api.post('/pets', data),
  update: (id: string, data: Partial<{
    name: string;
    breed: string;
    age: number;
    weight: number;
  }>) => api.put(`/pets/${id}`, data),
  delete: (id: string) => api.delete(`/pets/${id}`),
};
