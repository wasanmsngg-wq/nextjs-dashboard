import type { ReactNode } from "react";
import { lusitana } from "@/app/ui/fonts";

export function DirectoryTemplate({
  title,
  description,
  navigation,
  controls,
  children,
  footer,
  className = "w-full",
}: Readonly<{
  title: ReactNode;
  description?: string;
  navigation?: ReactNode;
  controls?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}>) {
  return (
    <main className={className}>
      {navigation ? <div className="mb-4">{navigation}</div> : null}
      <header className="mb-8">
        <h1 className={`${lusitana.className} text-2xl`}>{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        ) : null}
      </header>
      {controls ? <div className="mb-4">{controls}</div> : null}
      {children}
      {footer}
    </main>
  );
}
