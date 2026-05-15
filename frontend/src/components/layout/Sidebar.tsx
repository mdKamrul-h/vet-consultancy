'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  LayoutGrid,
  AlertTriangle,
  Search,
  Heart,
  Stethoscope,
  Home,
  Package,
  Star,
  Video,
  HelpCircle,
  RefreshCw,
  Siren,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const communityCategories = [
  { label: 'All posts', href: '/community', icon: LayoutGrid, count: null, key: 'all' },
  { label: 'Urgent rescue', href: '/community?cat=urgent_rescue', icon: Siren, count: 12, key: 'urgent_rescue' },
  { label: 'Lost & found', href: '/community?cat=lost_found', icon: Search, count: 8, key: 'lost_found' },
  { label: 'Adoption', href: '/community?cat=adoption', icon: Heart, count: 23, key: 'adoption' },
  { label: 'Medical help', href: '/community?cat=medical_help', icon: Stethoscope, count: 18, key: 'medical_help' },
  { label: 'Foster needed', href: '/community?cat=foster_needed', icon: Home, count: 15, key: 'foster_needed' },
  { label: 'Vet Consultancy', href: '/vet-consultancy', icon: Video, count: null, key: 'vet_consultancy', isSpecial: true },
  { label: 'Supplies & donations', href: '/community?cat=supplies_donations', icon: Package, count: null, key: 'supplies' },
  { label: 'Success stories', href: '/community?cat=success_stories', icon: Star, count: null, key: 'success' },
];

const postTypes = [
  { label: 'Questions', icon: HelpCircle, key: 'question' },
  { label: 'Updates', icon: RefreshCw, key: 'update' },
  { label: 'Rescue alert', icon: AlertTriangle, key: 'rescue_alert' },
  { label: 'Advice', icon: Lightbulb, key: 'advice' },
];

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isVetConsultancy = pathname.startsWith('/vet-consultancy');

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-40 overflow-y-auto transition-transform duration-300',
          'scrollbar-hide',
          {
            'translate-x-0': isOpen,
            '-translate-x-full': !isOpen,
            'lg:translate-x-0': true,
          }
        )}
      >
        <div className="p-4">
          {/* Community Section */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
              Community
            </p>
            <nav className="space-y-0.5">
              {communityCategories.map((cat) => {
                const Icon = cat.icon;
                const isActive = cat.isSpecial
                  ? isVetConsultancy
                  : pathname === cat.href || pathname.includes(cat.key);

                return (
                  <Link
                    key={cat.key}
                    href={cat.href}
                    onClick={onClose}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group',
                      {
                        'bg-primary text-white font-semibold': isActive && cat.isSpecial,
                        'bg-primary-50 text-primary font-medium': isActive && !cat.isSpecial,
                        'text-gray-600 hover:bg-gray-50 hover:text-gray-900': !isActive,
                      }
                    )}
                  >
                    <Icon
                      size={17}
                      className={clsx({
                        'text-white': isActive && cat.isSpecial,
                        'text-primary': isActive && !cat.isSpecial,
                        'text-gray-400 group-hover:text-gray-600': !isActive,
                      })}
                    />
                    <span className="flex-1">{cat.label}</span>
                    {cat.count !== null && (
                      <span
                        className={clsx(
                          'text-xs font-medium px-1.5 py-0.5 rounded-full',
                          {
                            'bg-white/20 text-white': isActive && cat.isSpecial,
                            'bg-primary/10 text-primary': isActive && !cat.isSpecial,
                            'bg-gray-100 text-gray-500': !isActive,
                          }
                        )}
                      >
                        {cat.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-4" />

          {/* Post Type Filter */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
              Post Type
            </p>
            <div className="space-y-0.5">
              {postTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Link
                    key={type.key}
                    href={`/community?type=${type.key}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                  >
                    <Icon size={16} className="text-gray-400 group-hover:text-gray-600" />
                    {type.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-4" />

          {/* CTA Card */}
          <div className="bg-gradient-to-br from-primary-50 to-orange-50 border border-primary-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-primary" />
              <p className="text-sm font-semibold text-gray-900">Make a bigger impact</p>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Join our community of pet lovers and help animals in need.
            </p>
            <Link
              href="/community"
              onClick={onClose}
              className="block w-full text-center px-3 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors"
            >
              Explore Community
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
