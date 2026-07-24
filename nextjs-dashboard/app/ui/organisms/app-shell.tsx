'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AppHeader } from './app-header';
import { SideNavigation } from './side-navigation';

export default function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    if (!sidebarOpen) return;
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setSidebarOpen(false);
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [sidebarOpen]);
  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <AppHeader sidebarOpen={sidebarOpen} onOpen={() => setSidebarOpen(true)} />
      <div className={sidebarOpen ? 'fixed inset-0 z-40 bg-gray-950/35' : 'hidden'} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      <SideNavigation open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="p-5 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}
