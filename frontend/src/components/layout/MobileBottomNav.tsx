'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Stethoscope, Users, ClipboardList, User } from 'lucide-react';
import clsx from 'clsx';

const tabs = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Vet Care', href: '/vet-consultancy', icon: Stethoscope },
  { label: 'Community', href: '/community', icon: Users },
  { label: 'History', href: '/consultations', icon: ClipboardList },
  { label: 'Profile', href: '/profile', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-stretch h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active =
            tab.href === '/vet-consultancy'
              ? pathname.startsWith('/vet-consultancy')
              : pathname === tab.href || pathname.startsWith(tab.href + '/');

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'relative flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors',
                active ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full" />
              )}
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] leading-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
