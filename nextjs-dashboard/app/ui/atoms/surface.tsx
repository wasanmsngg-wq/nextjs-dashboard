import clsx from "clsx";
import type { HTMLAttributes } from "react";

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "div" | "li" | "section";
  padding?: "none" | "compact" | "default" | "spacious";
};

const paddingClasses = {
  none: "",
  compact: "p-4",
  default: "p-5 sm:p-6",
  spacious: "p-6 sm:p-8",
};

export function Surface({
  as: Component = "div",
  padding = "default",
  className,
  ...props
}: SurfaceProps) {
  return (
    <Component
      className={clsx(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        paddingClasses[padding],
        className,
      )}
      {...props}
    />
  );
}
