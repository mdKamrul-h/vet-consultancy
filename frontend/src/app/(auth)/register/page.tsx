'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PawPrint, Eye, EyeOff, Mail, Lock, User, Stethoscope, CheckCircle, Building2, ClipboardList, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PET_OWNER' as 'PET_OWNER' | 'VET',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      const errMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(errMsg);

      // Demo: simulate successful registration
      const mockUser = {
        id: 'new_' + Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('pawpet_token', 'demo_token_' + Date.now());
      localStorage.setItem('pawpet_user', JSON.stringify(mockUser));
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-vet-green to-green-800 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <PawPrint size={28} className="text-white" />
            </div>
            <span className="text-3xl font-bold">Pawpet</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Join thousands of happy pet families
          </h2>
          <p className="text-green-100 text-lg mb-8">
            Create your free account and get expert vet advice for your furry friends.
          </p>

          <div className="space-y-4">
            {[
              { icon: CheckCircle, text: 'Free account, no subscription required' },
              { icon: Building2, text: 'Access to 200+ verified veterinarians' },
              { icon: ClipboardList, text: 'Keep digital pet health records' },
              { icon: MessageCircle, text: 'Join the pet lover community' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <item.icon size={16} className="text-primary shrink-0" />
                <span className="text-green-50">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Register form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <PawPrint size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Paw<span className="text-primary">pet</span>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
            <p className="text-gray-500 mb-6">Join Pawpet — it&apos;s free!</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Role selector */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('role', 'PET_OWNER')}
                  className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${
                    formData.role === 'PET_OWNER'
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <PawPrint
                    size={24}
                    className={formData.role === 'PET_OWNER' ? 'text-primary' : 'text-gray-400'}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      formData.role === 'PET_OWNER' ? 'text-primary' : 'text-gray-600'
                    }`}
                  >
                    Pet Owner
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('role', 'VET')}
                  className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${
                    formData.role === 'VET'
                      ? 'border-vet-green bg-vet-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Stethoscope
                    size={24}
                    className={formData.role === 'VET' ? 'text-vet-green' : 'text-gray-400'}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      formData.role === 'VET' ? 'text-vet-green' : 'text-gray-600'
                    }`}
                  >
                    Veterinarian
                  </span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <button type="button" className="text-primary hover:underline">Terms of Service</button>{' '}
                and{' '}
                <button type="button" className="text-primary hover:underline">Privacy Policy</button>.
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-600 disabled:opacity-60 transition-colors"
              >
                {isLoading ? 'Creating account...' : 'Create free account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
