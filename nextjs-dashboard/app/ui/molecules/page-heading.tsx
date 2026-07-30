import clsx from "clsx";
import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
  inverse = false,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <header className={clsx("space-y-2", className)}>
      {eyebrow ? (
        <p
          className={clsx(
            "text-sm font-semibold uppercase tracking-wider",
            inverse ? "text-blue-100" : "text-blue-700",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={clsx(
          "text-3xl font-bold tracking-tight sm:text-4xl",
          inverse ? "text-white" : "text-slate-950",
        )}
      >
        {title}
      </h1>
      {description ? (
        <p
          className={clsx(
            "max-w-2xl",
            inverse ? "text-blue-50" : "text-slate-600",
          )}
        >
          {description}
        </p>
      ) : null}
      {actions ? (
        <div className="flex flex-wrap gap-3 pt-3">{actions}</div>
      ) : null}
    </header>
  );
}
