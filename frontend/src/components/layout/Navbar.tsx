'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  PawPrint,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
}

export function Navbar({ onMenuToggle, sidebarOpen }: NavbarProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const roleLabel =
    user?.role === 'VET' ? 'Vet' : user?.role === 'ADMIN' ? 'Admin' : 'Pet Owner';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
      <div className="flex items-center h-full px-4 gap-4">
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <PawPrint size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 hidden sm:block">
            Paw<span className="text-primary">pet</span>
          </span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search vets, posts, pets..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setDropdownOpen(false);
              }}
              className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="p-3 space-y-2">
                  <div className="p-3 rounded-lg bg-primary-50 border border-primary-100">
                    <p className="text-sm font-medium text-gray-900">
                      Dr. Aisha Rahman accepted your urgent request
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                  </div>
                  <div className="p-3 rounded-lg hover:bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">
                      Your consultation is scheduled for tomorrow
                    </p>
                    <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-100 text-center">
                  <button className="text-sm text-primary font-medium hover:underline">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User avatar + dropdown */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {user?.name?.split(' ')[0]}
                  </p>
                  <p className="text-xs text-gray-500">{roleLabel}</p>
                </div>
                <ChevronDown size={16} className="text-gray-500 hidden sm:block" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary text-xs font-medium rounded-full">
                      {roleLabel}
                    </span>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                    <Link
                      href="/consultations"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings size={16} />
                      My Consultations
                    </Link>
                  </div>
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(dropdownOpen || notifOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setDropdownOpen(false);
            setNotifOpen(false);
          }}
        />
      )}
    </nav>
  );
}

export default Navbar;
