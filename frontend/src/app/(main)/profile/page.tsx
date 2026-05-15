'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Camera,
  Plus,
  Edit,
  Trash2,
  PawPrint,
  Save,
  X,
} from 'lucide-react';
import { Pet } from '@/types';
import { petApi } from '@/lib/api';

const mockPets: Pet[] = [
  {
    id: 'p1',
    ownerId: 'u1',
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
    ownerId: 'u1',
    name: 'Luna',
    species: 'Cat',
    breed: 'Indian Indie',
    age: 2,
    ageUnit: 'years',
    gender: 'female',
    weight: 4,
  },
];


export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [pets, setPets] = useState<Pet[]>(mockPets);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAddPet, setShowAddPet] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: '',
  });

  const [newPet, setNewPet] = useState<{
    name: string;
    species: string;
    breed: string;
    age: string;
    ageUnit: 'years' | 'months';
    gender: 'male' | 'female';
    weight: string;
  }>({
    name: '',
    species: 'Dog',
    breed: '',
    age: '',
    ageUnit: 'years',
    gender: 'male',
    weight: '',
  });

  const handleSaveProfile = () => {
    if (user) {
      updateUser({ ...user, name: profileForm.name });
    }
    setIsEditingProfile(false);
  };

  const handleAddPet = async () => {
    if (!newPet.name || !newPet.age) return;

    const petData = {
      id: 'p' + Date.now(),
      ownerId: user?.id || '',
      name: newPet.name,
      species: newPet.species,
      breed: newPet.breed || undefined,
      age: parseInt(newPet.age),
      ageUnit: newPet.ageUnit,
      gender: newPet.gender,
      weight: newPet.weight ? parseFloat(newPet.weight) : undefined,
    };

    try {
      await petApi.create({
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        age: petData.age,
        ageUnit: petData.ageUnit,
        gender: petData.gender,
        weight: petData.weight,
      });
    } catch {
      // Use local state for demo
    }

    setPets((prev) => [...prev, petData]);
    setShowAddPet(false);
    setNewPet({ name: '', species: 'Dog', breed: '', age: '', ageUnit: 'years', gender: 'male', weight: '' });
  };

  const handleDeletePet = async (petId: string) => {
    try {
      await petApi.delete(petId);
    } catch {
      // Use local state for demo
    }
    setPets((prev) => prev.filter((p) => p.id !== petId));
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const roleLabel =
    user?.role === 'VET' ? 'Veterinarian' : user?.role === 'ADMIN' ? 'Administrator' : 'Pet Owner';

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Profile card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        {/* Cover */}
        <div className="h-24 bg-gradient-to-r from-primary to-orange-500" />

        {/* Avatar + basic info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-sm">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-sm">
                <Camera size={13} className="text-gray-600" />
              </button>
            </div>

            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                <Edit size={14} />
                Edit profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600"
                >
                  <Save size={14} />
                  Save
                </button>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {isEditingProfile ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+880 1XXX-XXXXXX"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="px-2.5 py-0.5 bg-primary-50 text-primary text-xs font-semibold rounded-full">
                  {roleLabel}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Mail size={13} />
                  {user?.email}
                </span>
                {profileForm.phone && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Phone size={13} />
                    {profileForm.phone}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* My pets */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <PawPrint size={18} className="text-primary" />
            My Pets
          </h2>
          <button
            onClick={() => setShowAddPet(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus size={16} />
            Add pet
          </button>
        </div>

        {pets.length === 0 ? (
          <div className="text-center py-6">
            <PawPrint size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No pets added yet</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {pets.map((pet) => (
              <div key={pet.id} className="border border-gray-200 rounded-xl p-4 relative group">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <PawPrint size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{pet.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        pet.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                      }`}>
                        {pet.gender === 'male' ? '♂' : '♀'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{pet.breed || pet.species}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{pet.age} {pet.ageUnit}</span>
                      {pet.weight && (
                        <>
                          <span>·</span>
                          <span>{pet.weight} kg</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setEditingPetId(editingPetId === pet.id ? null : pet.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePet(pet.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add pet form */}
        {showAddPet && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-gray-900 mb-4">Add new pet</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pet name *</label>
                <input
                  type="text"
                  value={newPet.name}
                  onChange={(e) => setNewPet((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Max"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Species</label>
                <select
                  value={newPet.species}
                  onChange={(e) => setNewPet((p) => ({ ...p, species: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Other'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Breed</label>
                <input
                  type="text"
                  value={newPet.breed}
                  onChange={(e) => setNewPet((p) => ({ ...p, breed: e.target.value }))}
                  placeholder="e.g. Labrador"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={newPet.gender}
                  onChange={(e) => setNewPet((p) => ({ ...p, gender: e.target.value as 'male' | 'female' }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Age *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newPet.age}
                    onChange={(e) => setNewPet((p) => ({ ...p, age: e.target.value }))}
                    placeholder="0"
                    min="0"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <select
                    value={newPet.ageUnit}
                    onChange={(e) => setNewPet((p) => ({ ...p, ageUnit: e.target.value as 'years' | 'months' }))}
                    className="w-24 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                  >
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={newPet.weight}
                  onChange={(e) => setNewPet((p) => ({ ...p, weight: e.target.value }))}
                  placeholder="0.0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAddPet(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPet}
                className="flex-1 px-4 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-600"
              >
                Add pet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
