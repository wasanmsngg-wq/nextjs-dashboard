"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { AppHeader } from "./app-header";
import { SideNavigation } from "./side-navigation";

export default function AppShell({
  children,
  userEmail,
  isAdmin,
}: {
  children: ReactNode;
  userEmail?: string;
  isAdmin: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigationTriggerRef = useRef<HTMLButtonElement>(null);
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    window.setTimeout(() => navigationTriggerRef.current?.focus(), 0);
  }, []);
  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <div inert={sidebarOpen ? true : undefined}>
        <AppHeader
          sidebarOpen={sidebarOpen}
          onOpen={() => setSidebarOpen(true)}
          navigationTriggerRef={navigationTriggerRef}
        />
        <main className="p-5 sm:p-6 lg:p-10">{children}</main>
      </div>
      <div
        className={sidebarOpen ? "fixed inset-0 z-40 bg-gray-950/35" : "hidden"}
        onClick={closeSidebar}
        aria-hidden="true"
      />
      <SideNavigation
        open={sidebarOpen}
        onClose={closeSidebar}
        userEmail={userEmail}
        isAdmin={isAdmin}
      />
    </div>
  );
}
