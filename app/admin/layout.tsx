import type { ReactNode } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ToastContainer } from "@/components/ui/toast-container"
import { ToastProvider } from "@/context/toast-context"

interface AdminLayoutProps {
    children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <ToastProvider>
            <div className="min-h-screen bg-background">
                <ToastContainer />
                <AdminSidebar />
                <div className="min-h-screen lg:pl-64">{children}</div>
            </div>
        </ToastProvider>
    )
}
