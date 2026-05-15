import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Check, Star, Clock, Globe, Video, MessageCircle } from 'lucide-react';
import { Vet } from '@/types';

interface VetCardProps {
  vet: Vet;
  onChoose?: (vet: Vet) => void;
  consultationId?: string;
}

export function VetCard({ vet, onChoose, consultationId }: VetCardProps) {
  const initials = vet.name
    .split(' ')
    .slice(1)
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-orange-100 flex items-center justify-center text-primary font-bold text-lg">
            {initials}
          </div>
          {vet.isOnline && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">{vet.name}</h3>
                {vet.isVerified && (
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <Check size={11} className="text-white" />
                  </span>
                )}
              </div>
              <p className="text-sm text-primary font-medium">{vet.specialty}</p>
              <p className="text-xs text-gray-500">{vet.degree}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-gray-900">৳{vet.consultationFee}</p>
              <p className="text-xs text-gray-500">per session</p>
            </div>
          </div>

          {/* Rating and stats */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className={clsx({
                    'text-yellow-400 fill-yellow-400': star <= Math.floor(vet.rating),
                    'text-gray-200 fill-gray-200': star > Math.floor(vet.rating),
                  })}
                />
              ))}
              <span className="text-sm font-semibold text-gray-700 ml-1">{vet.rating}</span>
              <span className="text-xs text-gray-400">({vet.reviewCount})</span>
            </div>

            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-600">{vet.experience} yrs exp</span>

            <span className="text-gray-300">·</span>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock size={12} />
              {vet.responseTime}
            </div>
          </div>

          {/* Languages */}
          <div className="flex items-center gap-1.5 mt-2">
            <Globe size={12} className="text-gray-400" />
            <span className="text-xs text-gray-500">{vet.languages.join(', ')}</span>
          </div>

          {/* Consultation types */}
          <div className="flex items-center gap-2 mt-2">
            {vet.consultationTypes.includes('video') && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                <Video size={10} />
                Video
              </span>
            )}
            {vet.consultationTypes.includes('chat') && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 text-xs font-medium rounded-full">
                <MessageCircle size={10} />
                Chat
              </span>
            )}
            {vet.isOnline ? (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Online now
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full">
                Offline
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
        <Link
          href={`/vet-consultancy/browse/${vet.id}`}
          className="flex-1 text-center px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          View profile
        </Link>
        <button
          onClick={() => onChoose?.(vet)}
          className="flex-1 px-4 py-2.5 bg-vet-green text-white text-sm font-semibold rounded-lg hover:bg-vet-green-600 transition-colors"
        >
          {consultationId ? 'Choose & continue' : 'Book now'}
        </button>
      </div>
    </div>
  );
}

export default VetCard;
