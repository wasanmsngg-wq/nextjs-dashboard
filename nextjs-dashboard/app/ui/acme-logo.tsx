import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function AcmeLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none ${
        compact ? 'text-blue-600' : 'text-white'
      }`}
    >
      <GlobeAltIcon
        className={`${compact ? 'h-8 w-8' : 'h-12 w-12'} rotate-[15deg]`}
      />
      <p className={compact ? 'text-2xl' : 'text-[44px]'}>Acme</p>
    </div>
  );
}
