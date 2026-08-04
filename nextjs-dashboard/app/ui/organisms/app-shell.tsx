"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppHeader } from "./app-header";
import { SideNavigation } from "./side-navigation";
import { RouteTransitionLoading } from "@/app/ui/templates/route-transition-loading";

export default function AppShell({
  children,
  userEmail,
  isAdmin,
}: {
  children: ReactNode;
  userEmail?: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{
    href: string;
    fromPathname: string;
  } | null>(null);
  const navigationPending =
    pendingNavigation?.fromPathname === pathname &&
    pendingNavigation.href !== pathname;
  const navigationTriggerRef = useRef<HTMLButtonElement>(null);
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    window.setTimeout(() => navigationTriggerRef.current?.focus(), 0);
  }, []);
  const beginNavigation = useCallback(
    (href: string) => {
      setSidebarOpen(false);
      if (href === pathname) return;
      setPendingNavigation({ href, fromPathname: pathname });
      window.requestAnimationFrame(() =>
        window.requestAnimationFrame(() => router.push(href)),
      );
    },
    [pathname, router],
  );
  useEffect(() => {
    if (!pendingNavigation) return;
    const delay = navigationPending ? 15_000 : 0;
    const timeout = window.setTimeout(() => setPendingNavigation(null), delay);
    return () => window.clearTimeout(timeout);
  }, [navigationPending, pendingNavigation]);
  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <div inert={sidebarOpen ? true : undefined}>
        <AppHeader
          sidebarOpen={sidebarOpen}
          onOpen={() => setSidebarOpen(true)}
          navigationTriggerRef={navigationTriggerRef}
        />
        <main className="p-5 sm:p-6 lg:p-10">
          {navigationPending ? <RouteTransitionLoading /> : children}
        </main>
      </div>
      <div
        className={sidebarOpen ? "fixed inset-0 z-40 bg-gray-950/35" : "hidden"}
        onClick={closeSidebar}
        aria-hidden="true"
      />
      <SideNavigation
        open={sidebarOpen}
        onClose={closeSidebar}
        onNavigate={beginNavigation}
        userEmail={userEmail}
        isAdmin={isAdmin}
      />
    </div>
  );
}
