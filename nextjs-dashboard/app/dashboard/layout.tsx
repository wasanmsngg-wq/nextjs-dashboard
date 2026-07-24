import AppShell from "@/app/ui/organisms/app-shell";

export default function Layout({children}: Readonly<{ children: React.ReactNode }>){
    return (
        <AppShell>{children}</AppShell>
    )
}
