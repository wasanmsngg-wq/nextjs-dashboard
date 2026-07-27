import {ReactNode} from "react";
import AppShell from "@/app/ui/organisms/app-shell";
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Layout({children} : Readonly<{ children: ReactNode }>){
 const session = await auth();
 if (!session) redirect('/login?callbackUrl=/support');

 return (
     <AppShell>
         {children}
     </AppShell>
 )
}
