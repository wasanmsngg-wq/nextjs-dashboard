import {ReactNode} from "react";
import AppShell from "@/app/ui/organisms/app-shell";

export default function Layout({children} : Readonly<{ children: ReactNode }>){
 return (
     <AppShell>
         {children}
     </AppShell>
 )
}
