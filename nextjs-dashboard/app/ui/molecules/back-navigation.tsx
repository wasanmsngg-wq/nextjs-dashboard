import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";

export function BackNavigation({
  href,
  children,
  inverse = false,
}: {
  href: string;
  children: ReactNode;
  inverse?: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        inverse
          ? "text-blue-100 hover:text-white focus-visible:outline-white"
          : "text-blue-700 hover:text-blue-900 focus-visible:outline-blue-500",
      )}
    >
      <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
      <span>{children}</span>
    </Link>
  );
}
