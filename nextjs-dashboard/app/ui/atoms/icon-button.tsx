import clsx from "clsx";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { VisuallyHidden } from "./visually-hidden";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  function IconButton({ label, children, className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={clsx(
          "inline-flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
        <VisuallyHidden>{label}</VisuallyHidden>
      </button>
    );
  },
);
