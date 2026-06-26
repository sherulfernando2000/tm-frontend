// layout/DashboardLayout.tsx
// layout/DashboardLayout.tsx
import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { SiteHeader } from "../components/site-header";
import { Outlet } from "react-router-dom";


interface DashboardLayoutProps {
  children?: ReactNode;
  data?: any; // If your DataTable needs it
}

export function DashboardLayout({  }: DashboardLayoutProps) {
  return (
         <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <Outlet/>
            </SidebarInset>
        </SidebarProvider>
  );
}
