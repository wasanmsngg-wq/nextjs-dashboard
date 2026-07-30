import { cookies } from "next/headers";
import {
  defaultLocale,
  isLocale,
  legacyLocaleCookie,
  localeCookie,
  type Locale,
} from "@/app/i18n/config";
import { translate } from "@/app/i18n/dictionaries";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value =
    cookieStore.get(localeCookie)?.value ??
    cookieStore.get(legacyLocaleCookie)?.value;
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
