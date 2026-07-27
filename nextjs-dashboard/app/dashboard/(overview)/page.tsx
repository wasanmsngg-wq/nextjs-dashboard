import { getTranslations } from '@/app/i18n/server';
import { lusitana } from '@/app/ui/fonts';

export default async function Page() {
  const { t } = await getTranslations();

  return (
    <main>
      <h1 className={`${lusitana.className} text-xl md:text-2xl`}>
        {t('Dashboard')}
      </h1>
    </main>
  );
}
