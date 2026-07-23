'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type SupportNavigationContextValue = {
  isNavigating: boolean;
  startNavigation: () => void;
};

const SupportNavigationContext =
  createContext<SupportNavigationContextValue>({
    isNavigating: false,
    startNavigation: () => undefined,
  });

const MINIMUM_SKELETON_TIME = 250;

export function SupportNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [isNavigating, setIsNavigating] = useState(false);
  const startedAt = useRef(0);
  const startedRouteKey = useRef('');
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startNavigation = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    startedAt.current = Date.now();
    startedRouteKey.current = routeKey;
    setIsNavigating(true);
  }, [routeKey]);

  useEffect(() => {
    if (!isNavigating || routeKey === startedRouteKey.current) return;

    const elapsed = Date.now() - startedAt.current;
    const remaining = Math.max(0, MINIMUM_SKELETON_TIME - elapsed);

    timeout.current = setTimeout(() => {
      setIsNavigating(false);
      timeout.current = null;
    }, remaining);

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [routeKey, isNavigating]);

  return (
    <SupportNavigationContext.Provider
      value={{ isNavigating, startNavigation }}
    >
      {children}
    </SupportNavigationContext.Provider>
  );
}

export function useSupportNavigation() {
  return useContext(SupportNavigationContext);
}
