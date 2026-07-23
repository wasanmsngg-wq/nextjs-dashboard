import AppShell from "@/app/ui/dashboard/app-shell";

export default function Layout({children}: Readonly<{ children: React.ReactNode }>){
    return (
        <AppShell>{children}</AppShell>
    )
}
