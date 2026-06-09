import { Consultation, Pet } from '@/types';
import { demoDelay, mockResponse } from './demo';
import { demoStore } from './demoStore';
import {
  DEMO_CREDENTIALS,
  MOCK_CONSULTATIONS,
  MOCK_VETS,
  createDemoUser,
  findVetById,
  vetToBackendShape,
} from './mockData';

export const demoAuthApi = {
  async login(email: string, password: string) {
    await demoDelay();
    const account = DEMO_CREDENTIALS[email.toLowerCase()];
    if (account && account.password === password) {
      return mockResponse({ token: 'demo-token', user: account.user });
    }
    if (password === 'password123') {
      const user = createDemoUser({ name: email.split('@')[0], email, role: 'PET_OWNER' });
      return mockResponse({ token: 'demo-token', user });
    }
    return Promise.reject({ response: { data: { message: 'Invalid email or password' } } });
  },

  async register(data: { name: string; email: string; password: string; role: string }) {
    await demoDelay();
    const user = createDemoUser(data);
    return mockResponse({ token: 'demo-token', user });
  },

  async me() {
    await demoDelay(200);
    return mockResponse(null);
  },

  async logout() {
    return mockResponse({ ok: true });
  },
};

export const demoVetApi = {
  async list(params?: { online?: boolean }) {
    await demoDelay();
    let vets = MOCK_VETS;
    if (params?.online) vets = vets.filter((v) => v.isOnline);
    return mockResponse({ vets: vets.map(vetToBackendShape) });
  },

  async getById(id: string) {
    await demoDelay();
    const vet = findVetById(id);
    return mockResponse({ vet: vetToBackendShape(vet) });
  },

  async getOnline() {
    await demoDelay();
    return mockResponse(MOCK_VETS.filter((v) => v.isOnline));
  },
};

export const demoConsultationApi = {
  async list() {
    await demoDelay();
    return mockResponse(MOCK_CONSULTATIONS);
  },

  async getById(id: string) {
    await demoDelay();
    const found = MOCK_CONSULTATIONS.find((c) => c.id === id);
    const consultation: Consultation = found ?? {
      ...MOCK_CONSULTATIONS[0],
      id,
      status: 'active',
      roomName: `pawpet-demo-${id}`,
      startedAt: new Date().toISOString(),
    };
    return mockResponse(consultation);
  },

  async create() {
    await demoDelay();
    return mockResponse({ consultation: { id: `c-demo-${Date.now()}` } });
  },

  async startSession(id: string) {
    await demoDelay();
    return mockResponse({ consultation: { id, status: 'active' } });
  },

  async endSession(id: string) {
    await demoDelay();
    return mockResponse({ consultation: { id, status: 'completed' } });
  },
};

export const demoUrgentApi = {
  async createConsultation() {
    await demoDelay(600);
    const id = `c-urgent-${Date.now()}`;
    return mockResponse({ consultation: { id } });
  },

  async startMatching(consultationId: string) {
    await demoDelay(600);
    return mockResponse({ requestId: `req_${consultationId}` });
  },

  async getStatus(requestId: string) {
    await demoDelay();
    return mockResponse({ requestId, status: 'searching' });
  },

  async acceptRequest(requestId: string) {
    await demoDelay();
    return mockResponse({ requestId, status: 'vet_accepted' });
  },
};

export const demoPaymentApi = {
  async initiate(data: { consultationId: string; method: string }) {
    await demoDelay(800);
    return mockResponse({
      payment: {
        id: `pay-${Date.now()}`,
        consultationId: data.consultationId,
        status: 'completed',
        method: data.method,
      },
    });
  },

  async verify(paymentId: string) {
    await demoDelay();
    return mockResponse({ paymentId, status: 'completed' });
  },

  async getByConsultation(consultationId: string) {
    await demoDelay();
    return mockResponse({ consultationId, status: 'completed' });
  },
};

export const demoPetApi = {
  async list() {
    await demoDelay();
    return mockResponse({ pets: demoStore.getPets() });
  },

  async create(data: {
    name: string;
    species: string;
    breed?: string;
    age: number;
    ageUnit: string;
    gender: string;
    weight?: number;
  }) {
    await demoDelay();
    const pet: Pet = {
      id: `p-${Date.now()}`,
      ownerId: 'u-demo-owner',
      name: data.name,
      species: data.species,
      breed: data.breed,
      age: data.age,
      ageUnit: data.ageUnit as Pet['ageUnit'],
      gender: data.gender as Pet['gender'],
      weight: data.weight,
    };
    demoStore.addPet(pet);
    return mockResponse({ pet });
  },

  async update(id: string, data: Partial<Pet>) {
    await demoDelay();
    const pets = demoStore.getPets().map((p) => (p.id === id ? { ...p, ...data } : p));
    return mockResponse({ pet: pets.find((p) => p.id === id) });
  },

  async delete(id: string) {
    await demoDelay();
    demoStore.removePet(id);
    return mockResponse({ ok: true });
  },
};
