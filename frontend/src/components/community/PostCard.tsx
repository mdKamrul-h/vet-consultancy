'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { Heart, MessageCircle, Share2, Clock, Bookmark } from 'lucide-react';
import { CommunityPost } from '@/types';

interface PostCardProps {
  post: CommunityPost;
  onLike?: (postId: string) => void;
}

const categoryColors: Record<string, string> = {
  urgent_rescue: 'bg-red-50 text-red-600 border-red-200',
  lost_found: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  adoption: 'bg-purple-50 text-purple-600 border-purple-200',
  medical_help: 'bg-blue-50 text-blue-600 border-blue-200',
  foster_needed: 'bg-green-50 text-green-700 border-green-200',
  vet_consultancy: 'bg-orange-50 text-orange-700 border-orange-200',
  supplies_donations: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  success_stories: 'bg-pink-50 text-pink-600 border-pink-200',
  all: 'bg-gray-50 text-gray-600 border-gray-200',
};

const typeColors: Record<string, string> = {
  question: 'bg-blue-50 text-blue-600',
  update: 'bg-green-50 text-green-600',
  rescue_alert: 'bg-red-50 text-red-600',
  advice: 'bg-purple-50 text-purple-600',
};

const categoryLabels: Record<string, string> = {
  urgent_rescue: 'Urgent Rescue',
  lost_found: 'Lost & Found',
  adoption: 'Adoption',
  medical_help: 'Medical Help',
  foster_needed: 'Foster Needed',
  vet_consultancy: 'Vet Consultancy',
  supplies_donations: 'Supplies & Donations',
  success_stories: 'Success Stories',
  all: 'General',
};

const typeLabels: Record<string, string> = {
  question: 'Question',
  update: 'Update',
  rescue_alert: 'Rescue Alert',
  advice: 'Advice',
};

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function PostCard({ post, onLike }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [saved, setSaved] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    onLike?.(post.id);
  };

  const initials = post.author.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-orange-100 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">{post.author.name}</p>
              <span
                className={clsx(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  typeColors[post.postType] || 'bg-gray-50 text-gray-600'
                )}
              >
                {typeLabels[post.postType] || post.postType}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock size={11} />
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={clsx(
              'text-xs font-medium px-2.5 py-1 rounded-full border',
              categoryColors[post.category] || 'bg-gray-50 text-gray-600 border-gray-200'
            )}
          >
            {categoryLabels[post.category] || post.category}
          </span>
          <button
            onClick={() => setSaved(!saved)}
            className={clsx(
              'p-1.5 rounded-lg transition-colors',
              saved ? 'text-primary bg-primary-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            )}
          >
            <Bookmark size={16} className={saved ? 'fill-primary' : ''} />
          </button>
        </div>
      </div>

      {/* Content */}
      <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{post.content}</p>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {post.images.slice(0, 2).map((img, i) => (
            <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={handleLike}
          className={clsx(
            'flex items-center gap-1.5 text-sm font-medium transition-colors',
            liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
          )}
        >
          <Heart size={16} className={liked ? 'fill-red-500' : ''} />
          <span>{likeCount}</span>
        </button>

        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors">
          <MessageCircle size={16} />
          <span>{post.comments}</span>
        </button>

        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors ml-auto">
          <Share2 size={16} />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
}

export default PostCard;
