'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PawPrint, Eye, EyeOff, Mail, Lock, Zap, Stethoscope, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isDemoMode } from '@/lib/demo';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const errMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid email or password';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo quick login using seeded accounts
  const demoLogin = async (role: 'PET_OWNER' | 'VET') => {
    const credentials =
      role === 'VET'
        ? { email: 'aisha.rahman@pawpet.vet', password: 'password123' }
        : { email: 'mahboob@example.com', password: 'password123' };

    setEmail(credentials.email);
    setPassword(credentials.password);
    setIsLoading(true);
    setError('');

    try {
      await login(credentials.email, credentials.password);
      router.push('/dashboard');
    } catch {
      setError('Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-orange-700 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <PawPrint size={28} className="text-white" />
            </div>
            <span className="text-3xl font-bold">Pawpet</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Vet care for your pets, anytime anywhere
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            Connect with verified veterinarians in minutes. Urgent consultations, regular checkups, and expert advice.
          </p>

          <div className="space-y-4">
            {[
              { icon: PawPrint, text: 'Connect with 200+ verified vets' },
              { icon: Zap, text: 'Urgent care available 24/7' },
              { icon: Shield, text: 'Secure & private consultations' },
              { icon: PawPrint, text: 'For all pet species' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <item.icon size={16} className="text-primary shrink-0" />
                <span className="text-orange-50">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <PawPrint size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Paw<span className="text-primary">pet</span>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-gray-500 mb-6">Sign in to your Pawpet account</p>

            {isDemoMode && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                Demo mode — use the quick access buttons below or any email with password <strong>password123</strong>.
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
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

              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-600 disabled:opacity-60 transition-colors"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center mb-3">Quick demo access</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => demoLogin('PET_OWNER')}
                  disabled={isLoading}
                  className="px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  <PawPrint size={14} className="inline mr-1.5" /> Pet Owner
                </button>
                <button
                  onClick={() => demoLogin('VET')}
                  disabled={isLoading}
                  className="px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  <Stethoscope size={14} className="inline mr-1.5" /> Vet Demo
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-gray-600 mt-5">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
