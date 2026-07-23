'use client'
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon, HeartIcon,
} from '@heroicons/react/24/outline';
import Link from "next/link";
import clsx from "clsx";
import {usePathname} from "next/navigation";
import { useI18n } from '@/app/i18n/provider';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Invoices',
    href: '/dashboard/invoices',
    icon: DocumentDuplicateIcon,
  },
  { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
  { name: 'Hospitals', href: '/support', icon: HeartIcon}
];

export default function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            prefetch={false}
            onClick={onNavigate}
            className={clsx("flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium text-gray-700 transition hover:bg-sky-50 hover:text-blue-600",{
              'bg-sky-100 text-blue-600' : pathname === link.href,
            })}
          >
            <LinkIcon className="w-6" />
            <p>{t(link.name)}</p>
          </Link>
        );
      })}
    </>
  );
}
