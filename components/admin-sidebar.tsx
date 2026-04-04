"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, FolderOpen, Megaphone, Menu, Package, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
    { id: "products", name: "Ürünler", icon: Package, href: "/admin" },
    { id: "categories", name: "Kategoriler", icon: FolderOpen, href: "/admin/categories" },
    { id: "campaigns", name: "Kampanyalar", icon: Megaphone, href: "/admin/campaigns" },
    {
        id: "settings",
        name: "Ayarlar",
        icon: Settings,
        href: "/admin/settings",
        children: [
            { id: "general", name: "Genel Profil", href: "/admin/settings" },
            { id: "appearance", name: "Görünüm", href: "/admin/settings/appearance" },
            { id: "perks", name: "Müşteri Avantajları", href: "/admin/settings/customer-perks" },
        ],
    },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(pathname.includes("/admin/settings"))

    const handleNavigate = (href: string) => {
        router.push(href)
        setSidebarOpen(false)
    }

    return (
        <>
            {!sidebarOpen && (
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSidebarOpen(true)}
                    className="fixed left-4 top-4 z-50 rounded-xl bg-background lg:hidden"
                    aria-label="Yönetim menüsünü aç"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            )}

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <Package className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-sidebar-foreground">MF Digital</span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden"
                            aria-label="Yönetim menüsünü kapat"
                        >
                            <X className="h-5 w-5 text-sidebar-foreground" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1 px-3 py-4">
                        {navItems.map((item) => {
                            const isActive = item.id === "settings"
                                ? pathname.startsWith("/admin/settings")
                                : pathname === item.href

                            return (
                                <div key={item.id} className="space-y-1">
                                    <button
                                        onClick={() => {
                                            if (item.children) {
                                                setIsSettingsOpen((prev) => !prev)
                                                return
                                            }

                                            handleNavigate(item.href)
                                        }}
                                        className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${isActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span className="min-w-0 flex-1 truncate text-left">{item.name}</span>
                                        {item.children && (
                                            <ChevronDown
                                                className={`h-4 w-4 transform transition-transform duration-200 ${isSettingsOpen ? "rotate-180" : ""}`}
                                            />
                                        )}
                                    </button>

                                    {item.children && (
                                        <AnimatePresence initial={false}>
                                            {isSettingsOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="space-y-1 pl-8 pt-1">
                                                        {item.children.map((child) => {
                                                            const isChildActive = pathname === child.href

                                                            return (
                                                                <button
                                                                    key={child.id}
                                                                    onClick={() => handleNavigate(child.href)}
                                                                    className={`block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm leading-snug transition ${isChildActive
                                                                        ? "font-medium text-black"
                                                                        : "text-gray-500 hover:text-black"
                                                                        }`}
                                                                >
                                                                    {child.name}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </div>
                            )
                        })}
                    </nav>

                    <div className="border-t border-sidebar-border p-4">
                        <Button variant="outline" onClick={() => handleNavigate("/")} className="w-full rounded-xl">
                            Ana Sayfaya Dön
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    )
}
