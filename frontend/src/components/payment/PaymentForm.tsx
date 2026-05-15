'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { CreditCard, Smartphone, Tag, Shield, Check } from 'lucide-react';

export type PaymentMethod = 'card' | 'bkash' | 'nagad' | 'mobile_banking';

interface PaymentFormProps {
  consultationFee: number;
  platformFee: number;
  onPay: (method: PaymentMethod, promoCode?: string) => void;
  isLoading?: boolean;
}

export function PaymentForm({
  consultationFee,
  platformFee,
  onPay,
  isLoading = false,
}: PaymentFormProps) {
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  const VALID_PROMOS: Record<string, number> = {
    PAWPET10: 100,
    FIRSTVET: 150,
    SAVE20: 200,
  };

  const applyPromo = () => {
    const discount = VALID_PROMOS[promoCode.toUpperCase()];
    if (discount) {
      setPromoDiscount(discount);
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
      setPromoApplied(false);
      setPromoDiscount(0);
    }
  };

  const total = consultationFee + platformFee - promoDiscount;

  const paymentMethods = [
    {
      id: 'card' as PaymentMethod,
      label: 'Card Payment',
      desc: 'Visa / Mastercard',
      icon: <CreditCard size={20} className="text-blue-500" />,
      extra: (
        <div className="flex gap-2 mt-1">
          <div className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">VISA</div>
          <div className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">MC</div>
        </div>
      ),
    },
    {
      id: 'bkash' as PaymentMethod,
      label: 'bKash',
      desc: 'Mobile banking',
      icon: (
        <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">bK</span>
        </div>
      ),
      extra: null,
    },
    {
      id: 'nagad' as PaymentMethod,
      label: 'Nagad',
      desc: 'Mobile payment',
      icon: (
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">Ng</span>
        </div>
      ),
      extra: null,
    },
    {
      id: 'mobile_banking' as PaymentMethod,
      label: 'Mobile Banking',
      desc: 'Rocket, Upay, etc.',
      icon: <Smartphone size={20} className="text-purple-500" />,
      extra: null,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Promo code */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Promo Code
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              disabled={promoApplied}
            />
          </div>
          <button
            onClick={applyPromo}
            disabled={!promoCode || promoApplied}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Apply
          </button>
        </div>
        {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
        {promoApplied && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <Check size={12} />
            Promo applied! You save ৳{promoDiscount}
          </p>
        )}
      </div>

      {/* Payment breakdown */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Payment Details</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Consultation fee</span>
            <span className="font-medium">৳{consultationFee}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Platform fee</span>
            <span className="font-medium">৳{platformFee}</span>
          </div>
          {promoApplied && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Promo discount</span>
              <span className="font-medium">-৳{promoDiscount}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-xl text-primary">৳{total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment methods */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Payment Method
        </label>
        <div className="space-y-2">
          {paymentMethods.map((pm) => (
            <label
              key={pm.id}
              className={clsx(
                'flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all',
                {
                  'border-primary bg-primary-50': method === pm.id,
                  'border-gray-200 hover:border-gray-300': method !== pm.id,
                }
              )}
            >
              <input
                type="radio"
                name="payment_method"
                value={pm.id}
                checked={method === pm.id}
                onChange={() => setMethod(pm.id)}
                className="mt-1 accent-[#E85D26]"
              />
              <div className="flex items-start gap-3 flex-1">
                {pm.icon}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{pm.label}</p>
                  <p className="text-xs text-gray-500">{pm.desc}</p>
                  {pm.extra}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <Shield size={14} className="text-green-500 shrink-0" />
        <span>Your payment is secured with 256-bit SSL encryption</span>
      </div>

      {/* Pay button */}
      <button
        onClick={() => onPay(method, promoApplied ? promoCode : undefined)}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-bold text-base rounded-xl hover:bg-primary-600 disabled:opacity-60 transition-colors"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing payment...
          </>
        ) : (
          <>
            <Shield size={18} />
            Pay now · ৳{total}
          </>
        )}
      </button>
    </div>
  );
}

export default PaymentForm;
