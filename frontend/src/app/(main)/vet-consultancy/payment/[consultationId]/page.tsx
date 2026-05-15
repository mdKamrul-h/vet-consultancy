'use client';

import React, { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Video,
  Star,
  Shield,
  HelpCircle,
  Clock,
  Zap,
  CheckCircle,
} from 'lucide-react';
import { PaymentForm, PaymentMethod } from '@/components/payment/PaymentForm';
import { paymentApi } from '@/lib/api';

const breadcrumbs = [
  { label: 'Request details', done: true },
  { label: 'Choose vet', done: true },
  { label: 'Payment', active: true },
  { label: 'Consultation', done: false },
];

type PaymentStep = 'form' | 'processing' | 'success';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const consultationId = params.consultationId as string;

  // Read vet info from URL so the correct vet is shown after "Book Now"
  const vetName = searchParams.get('vetName') || 'Dr. Aisha Rahman';
  const vetFee = parseInt(searchParams.get('fee') || '800', 10);
  const slot = searchParams.get('slot') || 'Today, ASAP';

  const vetInitials = vetName
    .split(' ')
    .slice(1)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2) || 'DR';

  const PLATFORM_FEE = 50;
  const [step, setStep] = useState<PaymentStep>('form');
  const [paidMethod, setPaidMethod] = useState<string>('');
  const [paidTotal, setPaidTotal] = useState(0);

  const handlePay = async (method: PaymentMethod, promoCode?: string) => {
    // Step 1: show processing
    setStep('processing');
    setPaidMethod(method);

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 2200));

    try {
      await paymentApi.initiate({ consultationId, method, promoCode });
    } catch {
      // demo: continue regardless
    }

    // Step 2: show success
    const discount =
      promoCode === 'PAWPET10' ? 100 : promoCode === 'FIRSTVET' ? 150 : promoCode === 'SAVE20' ? 200 : 0;
    setPaidTotal(vetFee + PLATFORM_FEE - discount);
    setStep('success');

    // Auto-redirect after 3s
    setTimeout(() => {
      router.push(`/consultations/${consultationId}?paid=true`);
    }, 3000);
  };

  // --- Processing overlay ---
  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 p-8">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield size={28} className="text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Processing your payment</h2>
          <p className="text-gray-500 text-sm mb-6">
            Securely connecting to{' '}
            <span className="font-semibold capitalize">{paidMethod.replace('_', ' ')}</span>
            ...
          </p>
          <div className="space-y-2">
            {[
              { label: 'Verifying payment details', delay: 0 },
              { label: 'Authenticating with gateway', delay: 700 },
              { label: 'Confirming consultation booking', delay: 1500 },
            ].map((item, i) => (
              <ProcessingStep key={i} label={item.label} delay={item.delay} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Success overlay ---
  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 p-8">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={44} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment Successful!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your consultation with <span className="font-semibold text-gray-800">{vetName}</span> is confirmed.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-left mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount paid</span>
              <span className="font-bold text-green-700 text-base">৳{paidTotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment method</span>
              <span className="font-semibold capitalize">{paidMethod.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Booking ID</span>
              <span className="font-mono text-xs text-gray-700">#{consultationId.slice(-10).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Scheduled</span>
              <span className="font-semibold">{slot}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-4">Redirecting to your consultation in 3 seconds...</p>

          <button
            onClick={() => router.push(`/consultations/${consultationId}?paid=true`)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors"
          >
            <Zap size={18} />
            Go to consultation now
          </button>
        </div>
      </div>
    );
  }

  // --- Payment form ---
  return (
    <div className="px-4 lg:px-6 py-6 max-w-5xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft size={16} />
        Back to vet selection
      </button>

      {/* Breadcrumb */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex items-center">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.label}>
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    crumb.done
                      ? 'bg-green-500 text-white'
                      : crumb.active
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {crumb.done ? <Check size={12} /> : idx + 1}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    crumb.done ? 'text-green-600' : crumb.active ? 'text-primary' : 'text-gray-400'
                  }`}
                >
                  {crumb.label}
                </span>
              </div>
              {idx < breadcrumbs.length - 1 && (
                <ChevronRight size={16} className="text-gray-300 mx-2 flex-1 hidden sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pay to confirm your consultation</h1>
        <p className="text-gray-500 mt-1">Your session will be confirmed instantly after payment.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: form */}
        <div className="flex-1 min-w-0 space-y-5 order-2 lg:order-1">
          {/* Selected vet */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-bold text-gray-900 mb-4">Selected veterinarian</h2>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-vet-green-50 to-green-100 flex items-center justify-center text-vet-green font-bold text-lg shrink-0">
                {vetInitials}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-gray-900">{vetName}</h3>
                  <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check size={9} className="text-white" />
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={11} className="text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="text-xs text-gray-600 ml-1">Verified vet</span>
                </div>
              </div>
              <Link
                href="/vet-consultancy/browse"
                className="text-xs text-primary font-medium hover:underline shrink-0"
              >
                Change
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                <Calendar size={16} className="text-vet-green shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Scheduled</p>
                  <p className="text-sm font-semibold text-gray-900">{slot}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                <Clock size={16} className="text-vet-green shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-semibold text-gray-900">30 minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                <Video size={16} className="text-vet-green shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Mode</p>
                  <p className="text-sm font-semibold text-gray-900">Video consultation</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                <Shield size={16} className="text-vet-green shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Refund policy</p>
                  <p className="text-sm font-semibold text-gray-900">Full if cancelled 1h before</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment form */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-bold text-gray-900 mb-5">Payment</h2>
            <PaymentForm
              consultationFee={vetFee}
              platformFee={PLATFORM_FEE}
              onPay={handlePay}
              isLoading={false}
            />
          </div>
        </div>

        {/* Right: order summary */}
        <div className="space-y-4 order-1 lg:order-2 lg:w-80 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-5 lg:sticky lg:top-20">
            <h3 className="font-bold text-gray-900 mb-4">Order summary</h3>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-vet-green-50 rounded-lg flex items-center justify-center">
                  <Video size={18} className="text-vet-green" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Regular video consultation</p>
                  <p className="text-xs text-gray-500">with {vetName}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultation fee</span>
                  <span className="font-medium">৳{vetFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform fee</span>
                  <span className="font-medium">৳{PLATFORM_FEE}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary text-lg">৳{vetFee + PLATFORM_FEE}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Promo codes applied at checkout</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { icon: Shield, text: '256-bit SSL encryption', color: 'text-green-500' },
                { icon: Check, text: 'Verified payment gateway', color: 'text-blue-500' },
                { icon: Star, text: '4.8/5 average satisfaction', color: 'text-yellow-500' },
              ].map((badge) => {
                const Icon = badge.icon;
                return (
                  <div key={badge.text} className="flex items-center gap-2 text-xs text-gray-600">
                    <Icon size={13} className={badge.color} />
                    {badge.text}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1 font-semibold">Demo promo codes:</p>
              {['PAWPET10 (৳100 off)', 'FIRSTVET (৳150 off)', 'SAVE20 (৳200 off)'].map((c) => (
                <p key={c} className="text-xs text-gray-400 font-mono">{c}</p>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
                <HelpCircle size={16} />
                Need help with payment?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Animated processing step
function ProcessingStep({ label, delay }: { label: string; delay: number }) {
  const [done, setDone] = useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setDone(true), delay + 600);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${done ? 'bg-green-100' : 'bg-gray-100'}`}>
        {done ? (
          <Check size={11} className="text-green-600" />
        ) : (
          <div className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-primary animate-spin" />
        )}
      </div>
      <span className={`text-sm transition-colors ${done ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}
