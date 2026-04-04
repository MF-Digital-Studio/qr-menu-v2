"use client"

import { type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react"
import { useToast, type ToastType } from "@/context/toast-context"
import { cn } from "@/lib/utils"

const toastAppearance: Record<
    ToastType,
    {
        icon: ReactNode
        accent: string
        progress: string
        label: string
    }
> = {
    success: {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
        accent: "bg-emerald-50 text-emerald-700",
        progress: "bg-emerald-500",
        label: "Başarılı",
    },
    error: {
        icon: <AlertCircle className="h-5 w-5 text-rose-600" />,
        accent: "bg-rose-50 text-rose-700",
        progress: "bg-rose-500",
        label: "Hata",
    },
    info: {
        icon: <Info className="h-5 w-5 text-sky-600" />,
        accent: "bg-sky-50 text-sky-700",
        progress: "bg-sky-500",
        label: "Bilgi",
    },
}

export function ToastContainer() {
    const { toasts, removeToast } = useToast()

    return (
        <div className="pointer-events-none fixed top-6 right-6 z-100 space-y-3">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const appearance = toastAppearance[toast.type]

                    return (
                        <motion.div
                            key={toast.id}
                            layout
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 50, opacity: 0 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            className="pointer-events-auto w-[min(360px,calc(100vw-2rem))]"
                        >
                            <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/85 p-4 shadow-[0_20px_45px_-22px_rgba(15,23,42,0.45)] backdrop-blur-xl">
                                <div className="flex items-start gap-3">
                                    <div className={cn("mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl", appearance.accent)}>
                                        {appearance.icon}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            {appearance.label}
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-slate-900">{toast.message}</p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeToast(toast.id)}
                                        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                        aria-label="Bildirimi kapat"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <motion.div
                                    initial={{ scaleX: 1 }}
                                    animate={{ scaleX: 0 }}
                                    transition={{ duration: 3, ease: "linear" }}
                                    style={{ transformOrigin: "left" }}
                                    className={cn("absolute inset-x-0 bottom-0 h-0.75", appearance.progress)}
                                />
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
