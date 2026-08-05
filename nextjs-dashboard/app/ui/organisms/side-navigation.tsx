"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ClipboardDocumentCheckIcon,
  ChevronDownIcon,
  PowerIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import AcmeLogo from "@/app/ui/acme-logo";
import { useI18n } from "@/app/i18n/provider";
import { IconButton } from "@/app/ui/atoms/icon-button";
import { logout } from "@/app/lib/auth-actions";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { clearWorkoutQueue } from "@/app/features/workouts/data/workout-queue";

type NavigationItem = {
  name: string;
  href: string;
  icon: typeof HomeIcon;
  children?: Array<{ name: string; href: string }>;
};

const primaryLinks: NavigationItem[] = [
  { name: "Home", href: "/dashboard", icon: HomeIcon },
  {
    name: "Workouts",
    href: "/workouts",
    icon: ClipboardDocumentCheckIcon,
    children: [
      { name: "Workout history", href: "/workouts/history" },
      { name: "Exercise library", href: "/workouts/exercises" },
      { name: "Create template", href: "/workouts/templates/new" },
    ],
  },
];

const adminLink: NavigationItem = {
  name: "Administration",
  href: "/admin",
  icon: ShieldCheckIcon,
  children: [
    { name: "Users", href: "/admin/users" },
    { name: "Exercise records", href: "/admin/exercise-records" },
    {
      name: "Exercise categories",
      href: "/admin/master-data/categories",
    },
    { name: "System exercises", href: "/admin/master-data/exercises" },
    { name: "Customers", href: "/admin/customers" },
  ],
};

export function SideNavigation({
  open,
  onClose,
  onNavigate,
  userEmail,
  isAdmin,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
  userEmail?: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const sidebarRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const navigationItems = [...primaryLinks, ...(isAdmin ? [adminLink] : [])];
  const [groupOverrides, setGroupOverrides] = useState<
    Record<string, { expanded: boolean; pathname: string }>
  >({});
  const handleNavigation = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    onNavigate(href);
  };
  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !sidebarRef.current) return;
      const focusable = Array.from(
        sidebarRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);
  return (
    <aside
      ref={sidebarRef}
      id="application-sidebar"
      className={clsx(
        "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform bg-white shadow-xl transition-transform",
        open ? "translate-x-0" : "-translate-x-full",
      )}
      aria-hidden={!open}
      inert={!open}
      aria-label={t("Primary navigation")}
      aria-modal="true"
      role="dialog"
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        <AcmeLogo compact />
        <IconButton
          ref={closeButtonRef}
          label={t("Close navigation")}
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </IconButton>
      </div>
      <nav
        aria-label={t("Primary navigation")}
        className="flex h-[calc(100vh-4rem)] flex-col px-3 py-4"
      >
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {navigationItems.map(({ name, href, icon: Icon, children }) => {
            const groupActive =
              pathname === href || pathname.startsWith(`${href}/`);
            const groupOverride = groupOverrides[href];
            const groupExpanded =
              groupOverride?.pathname === pathname
                ? groupOverride.expanded
                : groupActive || groupOverride?.expanded || false;
            const submenuId = `${href.slice(1).replaceAll("/", "-")}-submenu`;
            return (
              <li key={href}>
                <div className="flex items-center gap-1">
                  <Link
                    href={href}
                    onClick={(event) => handleNavigation(event, href)}
                    className={clsx(
                      "flex h-12 min-w-0 flex-1 items-center gap-3 rounded-lg px-3 text-sm font-medium text-gray-700 hover:bg-sky-50 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500",
                      groupActive && "bg-sky-100 text-blue-600",
                    )}
                    aria-current={pathname === href ? "page" : undefined}
                  >
                    <Icon className="w-6 shrink-0" aria-hidden="true" />
                    <span>{t(name)}</span>
                  </Link>
                  {children ? (
                    <IconButton
                      label={t(
                        groupExpanded ? "Collapse submenu" : "Expand submenu",
                      )}
                      aria-controls={submenuId}
                      aria-expanded={groupExpanded}
                      onClick={() =>
                        setGroupOverrides((current) => ({
                          ...current,
                          [href]: {
                            expanded: !groupExpanded,
                            pathname,
                          },
                        }))
                      }
                      className="shrink-0 text-gray-600"
                    >
                      <ChevronDownIcon
                        className={clsx(
                          "h-5 w-5 transition-transform",
                          groupExpanded && "rotate-180",
                        )}
                        aria-hidden="true"
                      />
                    </IconButton>
                  ) : null}
                </div>
                {children && groupExpanded ? (
                  <ul
                    id={submenuId}
                    className="ml-6 border-l border-gray-200 py-1 pl-3"
                  >
                    {children.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={(event) =>
                              handleNavigation(event, child.href)
                            }
                            className={clsx(
                              "flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-sky-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500",
                              childActive &&
                                "bg-sky-50 font-semibold text-blue-700",
                            )}
                            aria-current={childActive ? "page" : undefined}
                          >
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full bg-current"
                              aria-hidden="true"
                            />
                            <span>{t(child.name)}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
        {userEmail ? (
          <form
            action={logout}
            className="border-t border-gray-200 pt-3"
            onSubmit={() => void clearWorkoutQueue()}
          >
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
