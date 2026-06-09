import { Pet } from '@/types';
import { MOCK_PETS } from './mockData';

const STORAGE_KEY = 'pawpet_demo_pets';

function readPets(): Pet[] {
  if (typeof window === 'undefined') return [...MOCK_PETS];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Pet[];
  } catch {
    // ignore
  }
  return [...MOCK_PETS];
}

function writePets(pets: Pet[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
}

export const demoStore = {
  getPets(): Pet[] {
    return readPets();
  },

  addPet(pet: Pet): Pet {
    const pets = readPets();
    pets.push(pet);
    writePets(pets);
    return pet;
  },

  removePet(id: string): void {
    writePets(readPets().filter((p) => p.id !== id));
  },

  reset(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  },
};
