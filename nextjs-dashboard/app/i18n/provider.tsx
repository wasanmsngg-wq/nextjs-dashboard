'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import thTH from 'antd/locale/th_TH';
import {
  localeCookie,
  type Locale,
} from '@/app/i18n/config';
import { translate } from '@/app/i18n/dictionaries';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState(initialLocale);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      setLocaleState(nextLocale);
      document.documentElement.lang = nextLocale;
      document.cookie = `${localeCookie}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
      router.refresh();
    },
    [router],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string, values?: Record<string, string | number>) =>
        translate(locale, key, values),
    }),
    [locale, setLocale],
  );

  return (
    <I18nContext.Provider value={value}>
      <ConfigProvider locale={locale === 'th' ? thTH : enUS}>
        {children}
      </ConfigProvider>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return context;
}
