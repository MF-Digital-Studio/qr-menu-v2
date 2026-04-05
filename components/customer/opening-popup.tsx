"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

const SESSION_KEY = "hasSeenPopup"

interface OpeningPopupProps {
    isPopupActive: boolean
    popupImage: string | null
    popupTitle: string | null
    popupMessage: string | null
}

export function OpeningPopup({
    isPopupActive,
    popupImage,
    popupTitle,
    popupMessage,
}: OpeningPopupProps) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (!isPopupActive) return
        if (sessionStorage.getItem(SESSION_KEY)) return
        // Small delay so the menu renders first
        const timer = setTimeout(() => setVisible(true), 600)
        return () => clearTimeout(timer)
    }, [isPopupActive])

    const dismiss = () => {
        setVisible(false)
        sessionStorage.setItem(SESSION_KEY, "1")
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="popup-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-9999 flex items-center justify-center p-4"
                    style={{
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                    }}
                    onClick={dismiss}
                >
                    <motion.div
                        key="popup-card"
                        initial={{ opacity: 0, scale: 0.92, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-sm rounded-4xl bg-white p-4 shadow-[0_30px_100px_rgba(0,0,0,0.4)]"
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={dismiss}
                            aria-label="Kapat"
                            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Image */}
                        {popupImage && (
                            <div className="h-36 overflow-hidden rounded-[18px] bg-zinc-100">
                                <img
                                    src={popupImage}
                                    alt={popupTitle ?? "Kampanya"}
                                    className="h-full w-full object-cover"
                                    crossOrigin="anonymous"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="space-y-2 px-1 py-3 text-center">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                                Özel Kampanya
                            </p>
                            {popupTitle && (
                                <h3 className="text-lg font-bold text-zinc-900">
                                    {popupTitle}
                                </h3>
                            )}
                            {popupMessage && (
                                <p className="text-sm leading-5 text-zinc-600">
                                    {popupMessage}
                                </p>
                            )}
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
