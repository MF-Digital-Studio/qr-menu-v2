"use client"

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react"

export type ToastType = "success" | "error" | "info"

export interface ToastItem {
    id: string
    message: string
    type: ToastType
}

interface ToastContextValue {
    toasts: ToastItem[]
    addToast: (message: string, type?: ToastType) => void
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)
const TOAST_DURATION = 3000

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([])
    const timersRef = useRef<Record<string, number>>({})

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))

        if (typeof window !== "undefined" && timersRef.current[id]) {
            window.clearTimeout(timersRef.current[id])
            delete timersRef.current[id]
        }
    }, [])

    const addToast = useCallback(
        (message: string, type: ToastType = "info") => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

            setToasts((prev) => [...prev, { id, message, type }].slice(-4))

            if (typeof window !== "undefined") {
                timersRef.current[id] = window.setTimeout(() => removeToast(id), TOAST_DURATION)
            }
        },
        [removeToast],
    )

    useEffect(() => {
        return () => {
            if (typeof window === "undefined") return

            Object.values(timersRef.current).forEach((timer) => window.clearTimeout(timer))
        }
    }, [])

    const value = useMemo(
        () => ({
            toasts,
            addToast,
            removeToast,
        }),
        [addToast, removeToast, toasts],
    )

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
    const context = useContext(ToastContext)

    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }

    return context
}
