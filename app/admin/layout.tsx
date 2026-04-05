import type { ReactNode } from "react"
import { auth } from "@/auth"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ToastContainer } from "@/components/ui/toast-container"
import { ToastProvider } from "@/context/toast-context"
import { getSettings } from "@/app/actions/settings-actions"

interface AdminLayoutProps {
    children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const [session, settings] = await Promise.all([auth(), getSettings()])
    const isAuthenticated = !!session

    return (
        <ToastProvider>
            <div className="min-h-screen bg-background">
                <ToastContainer />
                {isAuthenticated && (
                    <AdminSidebar
                        restaurantName={settings.restaurantName || "QR Menü"}
                        logoUrl={settings.logo}
                    />
                )}
                <div className={isAuthenticated ? "min-h-screen lg:pl-64" : "min-h-screen"}>
                    {children}
                </div>
            </div>
        </ToastProvider>
    )
}
