import {ReactNode, Suspense} from "react";
import {SupportNavigationProvider} from "@/app/ui/support/support-navigation";
import AppShell from "@/app/ui/dashboard/app-shell";

export default function Layout({children} : Readonly<{ children: ReactNode }>){
 return (
     <AppShell>
                <Suspense fallback={null}>
                    <SupportNavigationProvider>
                        {children}
                    </SupportNavigationProvider>
                </Suspense>
     </AppShell>
 )
}
