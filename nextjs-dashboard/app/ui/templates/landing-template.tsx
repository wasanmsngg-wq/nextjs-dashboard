import type { ReactNode } from 'react';

export function LandingTemplate({ header, introduction, action, hero }: { header: ReactNode; introduction: ReactNode; action: ReactNode; hero: ReactNode }) {
  return <main className="flex min-h-screen flex-col p-6"><header className="flex h-20 items-end rounded-lg bg-blue-500 p-4 md:h-52">{header}</header><section className="mt-4 flex grow flex-col gap-4 md:flex-row"><div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5">{introduction}{action}</div><div className="flex items-center justify-center p-6 md:w-3/5">{hero}</div></section></main>;
}
