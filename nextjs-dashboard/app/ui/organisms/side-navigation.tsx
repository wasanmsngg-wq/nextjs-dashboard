"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PowerIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import AcmeLogo from "@/app/ui/acme-logo";
import { useI18n } from "@/app/i18n/provider";
import { IconButton } from "@/app/ui/atoms/icon-button";
import { logout } from "@/app/lib/auth-actions";

const links = [{ name: "Home", href: "/dashboard", icon: HomeIcon }];

export function SideNavigation({
  open,
  onClose,
  userEmail,
  isAdmin,
}: {
  open: boolean;
  onClose: () => void;
  userEmail?: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <aside
      id="application-sidebar"
      className={clsx(
        "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform bg-white shadow-xl transition-transform",
        open ? "translate-x-0" : "-translate-x-full",
      )}
      aria-hidden={!open}
      inert={!open}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        <AcmeLogo compact />
        <IconButton label={t("Close navigation")} onClick={onClose}>
          <XMarkIcon className="h-6 w-6" />
        </IconButton>
      </div>
      <nav
        aria-label={t("Open navigation")}
        className="flex h-[calc(100vh-4rem)] flex-col px-3 py-4"
      >
        {[
          ...links,
          ...(isAdmin
            ? [
                {
                  name: "Customers",
                  href: "/admin/customers",
                  icon: UserGroupIcon,
                },
              ]
            : []),
        ].map(({ name, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            prefetch={false}
            onClick={onClose}
            className={clsx(
              "flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium text-gray-700 hover:bg-sky-50 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500",
              pathname === href && "bg-sky-100 text-blue-600",
            )}
          >
            <Icon className="w-6" />
            <span>{t(name)}</span>
          </Link>
        ))}
        <div className="grow" />
        {userEmail ? (
          <form action={logout}>
            <p className="truncate px-3 text-xs text-gray-500">{userEmail}</p>
            <button
              type="submit"
              className="flex h-12 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              <PowerIcon className="w-6" />
              <span>{t("Sign Out")}</span>
            </button>
          </form>
        ) : (
          <Link className="px-3 py-3 text-blue-700" href="/login">
            {t("Log in")}
          </Link>
        )}
      </nav>
    </aside>
  );
}
