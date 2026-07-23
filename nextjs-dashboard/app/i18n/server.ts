import { cookies } from 'next/headers';
import {
  defaultLocale,
  isLocale,
  localeCookie,
  type Locale,
} from '@/app/i18n/config';
import { translate } from '@/app/i18n/dictionaries';

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(localeCookie)?.value;
  return isLocale(value) ? value : defaultLocale;
}

export async function getTranslations() {
  const locale = await getLocale();
  return {
    locale,
    t: (key: string, values?: Record<string, string | number>) =>
      translate(locale, key, values),
  };
}
