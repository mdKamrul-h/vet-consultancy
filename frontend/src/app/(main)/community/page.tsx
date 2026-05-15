'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  TrendingUp,
  Users,
  Flame,
  Search,
  AlertTriangle,
  X,
} from 'lucide-react';
import { PostCard } from '@/components/community/PostCard';
import { CommunityPost, PostCategory } from '@/types';

const mockPosts: CommunityPost[] = [
  {
    id: 'p1',
    authorId: 'u1',
    author: {
      id: 'u1',
      name: 'Riya Karim',
      email: 'riya@example.com',
      role: 'PET_OWNER',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    title: 'URGENT: Found injured cat near Gulshan 2 circle',
    content:
      'Found a tabby cat with a badly injured hind leg near Gulshan 2 circle. She needs immediate vet attention. Can anyone help with transport to the nearest animal hospital? I cannot leave work right now. The cat is currently resting in a box near the tea stall.',
    category: 'urgent_rescue',
    postType: 'rescue_alert',
    likes: 47,
    comments: 23,
    tags: ['urgent', 'cat', 'gulshan', 'rescue'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p2',
    authorId: 'u2',
    author: {
      id: 'u2',
      name: 'Sajid Hossain',
      email: 'sajid@example.com',
      role: 'PET_OWNER',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    title: 'Is my cat\'s sneezing a sign of something serious?',
    content:
      'My 2-year-old female Persian cat has been sneezing frequently for the past 3 days. No discharge from eyes, eating normally, but seems a bit less playful than usual. Should I be worried? Has anyone experienced this? I already booked a vet consultation but curious about others\' experiences.',
    category: 'medical_help',
    postType: 'question',
    likes: 12,
    comments: 8,
    tags: ['cat', 'sneezing', 'advice', 'persian'],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p3',
    authorId: 'u3',
    author: {
      id: 'u3',
      name: 'Nadia Islam',
      email: 'nadia@example.com',
      role: 'PET_OWNER',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    title: '3 adorable Labrador puppies looking for loving homes',
    content:
      'My Labrador just had a litter of 3 beautiful puppies — 2 golden males and 1 black female. They\'re 6 weeks old and will be ready in 2 weeks. First vaccination done. Looking for responsible, loving pet owners in Dhaka only. Please message me with your experience owning dogs.',
    category: 'adoption',
    postType: 'update',
    likes: 89,
    comments: 34,
    images: ['https://picsum.photos/400/300?random=1'],
    tags: ['labrador', 'adoption', 'puppies', 'dhaka'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p4',
    authorId: 'u4',
    author: {
      id: 'u4',
      name: 'Dr. Tanvir Ahmed',
      email: 'tanvir@pawpet.com',
      role: 'VET',
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
    title: 'Important: Signs of heatstroke in pets during summer',
    content:
      'As temperatures rise in Bangladesh, it\'s crucial to recognize heatstroke signs in your pets. Watch for: excessive panting, drooling, glazed eyes, rapid heartbeat, difficulty breathing, disorientation, and vomiting. If you notice these, immediately move your pet to shade and apply cool (not cold) water.',
    category: 'medical_help',
    postType: 'advice',
    likes: 156,
    comments: 42,
    tags: ['heatstroke', 'summer', 'safety', 'veterinary-advice'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p5',
    authorId: 'u5',
    author: {
      id: 'u5',
      name: 'Meher Afroz',
      email: 'meher@example.com',
      role: 'PET_OWNER',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    title: 'UPDATE: Bruno is fully recovered! Thank you Pawpet community 🙏',
    content:
      'Three weeks ago I posted here asking for help when my German Shepherd Bruno suddenly stopped eating and seemed very lethargic. Thanks to the community\'s support and the urgent consultation I had with Dr. Aisha Rahman on Pawpet, Bruno has made a full recovery! He had a severe gastrointestinal infection.',
    category: 'success_stories',
    postType: 'update',
    likes: 203,
    comments: 67,
    tags: ['success', 'recovery', 'german-shepherd', 'thankful'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const categories: { id: PostCategory; label: string; count: number }[] = [
  { id: 'all', label: 'All posts', count: 156 },
  { id: 'urgent_rescue', label: 'Urgent rescue', count: 12 },
  { id: 'lost_found', label: 'Lost & found', count: 8 },
  { id: 'adoption', label: 'Adoption', count: 23 },
  { id: 'medical_help', label: 'Medical help', count: 18 },
  { id: 'foster_needed', label: 'Foster needed', count: 15 },
  { id: 'vet_consultancy', label: 'Vet consultancy', count: 7 },
  { id: 'supplies_donations', label: 'Supplies & donations', count: 9 },
  { id: 'success_stories', label: 'Success stories', count: 11 },
];

export default function CommunityPage() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('cat') as PostCategory | null;

  const [activeCategory, setActiveCategory] = useState<PostCategory>(catParam || 'all');
  const [posts, setPosts] = useState<CommunityPost[]>(mockPosts);
  const [showNewPost, setShowNewPost] = useState(false);

  useEffect(() => {
    if (catParam) {
      setActiveCategory(catParam);
    }
  }, [catParam]);

  const filteredPosts =
    activeCategory === 'all'
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Community</h1>
            <p className="text-gray-500 text-sm mt-0.5">Connect, share, and help pets in need</p>
          </div>
          <button
            onClick={() => setShowNewPost(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus size={18} />
            New post
          </button>
        </div>

        <div className="flex gap-6">
          {/* Left: main feed */}
          <div className="flex-1 min-w-0">
            {/* Category tabs */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 mb-5 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeCategory === cat.id
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat.label}
                    {cat.count > 0 && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                          activeCategory === cat.id
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {cat.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-5">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Post feed */}
            {filteredPosts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                <Users size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No posts in this category yet</p>
                <button
                  onClick={() => setShowNewPost(true)}
                  className="mt-3 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600"
                >
                  Be the first to post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} onLike={handleLike} />
                ))}
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <div className="hidden xl:block w-72 shrink-0 space-y-4">
            {/* Trending */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-primary" />
                <h3 className="font-semibold text-gray-900">Trending topics</h3>
              </div>
              <div className="space-y-2">
                {['#heatstroke', '#adoption', '#urgentrescue', '#catadvice', '#doghealth'].map(
                  (tag) => (
                    <button
                      key={tag}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Urgent alerts */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-500" />
                <h3 className="font-semibold text-red-800">Active rescue alerts</h3>
              </div>
              <div className="space-y-2">
                {[
                  { title: 'Injured cat, Gulshan 2', time: '2h ago', urgent: true },
                  { title: 'Lost Beagle, Dhanmondi', time: '5h ago', urgent: false },
                  { title: 'Abandoned puppies, Mirpur', time: '8h ago', urgent: true },
                ].map((alert) => (
                  <div
                    key={alert.title}
                    className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-red-100"
                  >
                    <Flame
                      size={13}
                      className={`shrink-0 mt-0.5 ${alert.urgent ? 'text-red-500' : 'text-orange-400'}`}
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{alert.title}</p>
                      <p className="text-xs text-gray-500">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community stats */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Community stats</h3>
              <div className="space-y-2">
                {[
                  { label: 'Total members', value: '2,451' },
                  { label: 'Active today', value: '186' },
                  { label: 'Posts this week', value: '89' },
                  { label: 'Animals rescued', value: '1,203' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{stat.label}</span>
                    <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* New post modal */}
        {showNewPost && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Create new post</h2>
                <button
                  onClick={() => setShowNewPost(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    {categories.slice(1).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Post type</label>
                  <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="question">Question</option>
                    <option value="update">Update</option>
                    <option value="rescue_alert">Rescue Alert</option>
                    <option value="advice">Advice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="Post title..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    rows={4}
                    placeholder="Share your story, question, or advice..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNewPost(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowNewPost(false)}
                    className="flex-1 px-4 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-600"
                  >
                    Publish post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
