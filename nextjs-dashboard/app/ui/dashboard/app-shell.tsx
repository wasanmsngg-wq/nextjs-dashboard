'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Bars3Icon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import AcmeLogo from '@/app/ui/acme-logo';
import SideNav from '@/app/ui/dashboard/sidenav';

export default function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Open navigation"
          aria-controls="application-sidebar"
          aria-expanded={sidebarOpen}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        <Link href="/" className="ml-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <AcmeLogo compact />
        </Link>

        <div className="ml-auto">
          <button
            type="button"
            disabled
            aria-label="User profile (coming soon)"
            className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full text-gray-400"
          >
            <UserCircleIcon className="h-8 w-8" />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-gray-950/35 transition-opacity duration-200 ${
          sidebarOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="application-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform bg-white shadow-xl transition-transform duration-200 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!sidebarOpen}
        inert={!sidebarOpen}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <AcmeLogo compact />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close navigation"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <SideNav onNavigate={() => setSidebarOpen(false)} />
      </aside>

      <main className="p-5 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}
