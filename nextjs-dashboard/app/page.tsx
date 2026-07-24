import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import {lusitana} from "@/app/ui/fonts";
import Image from "next/image";
import { getTranslations } from '@/app/i18n/server';
import { LandingTemplate } from '@/app/ui/templates/landing-template';

export default async function Page() {
  const { t } = await getTranslations();
  return (
    <LandingTemplate
      header={<AcmeLogo />}
      introduction={<>
          <div
              className="relative w-0 h-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-black"
          />
          <h1 className={`${lusitana.className} antialiased text-xl text-gray-800 md:text-3xl md:leading-normal`}>
            <strong>{t('Welcome to Acme.')}</strong>{' '}
            {t('Manage your hospital support network from one place.')}
          </h1>
      </>}
      action={
          <Link
            href="/dashboard"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
          >
            <span>{t('Open dashboard')}</span>
            <ArrowRightIcon className="w-5 md:w-6" aria-hidden="true" />
          </Link>
      }
      hero={<>
          <Image src={"/hero-desktop.png"}
                 alt={t('Dashboard preview on desktop')}
                 width={1000}
                 height={760}
                 className={"hidden md:block"}
          />
          <Image src={"/hero-mobile.png"}
                 alt={t('Dashboard preview on mobile')}
                 width={560}
                 height={620}
                 className={"md:hidden block"}
          />
      </>}
    />
  );
}
