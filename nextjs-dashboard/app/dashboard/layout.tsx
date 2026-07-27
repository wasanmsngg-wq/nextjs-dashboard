import AppShell from "@/app/ui/organisms/app-shell";
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Layout({children}: Readonly<{ children: React.ReactNode }>){
    const session = await auth();
    if (!session) redirect('/login?callbackUrl=/dashboard');

    return (
        <AppShell>{children}</AppShell>
    )
}
