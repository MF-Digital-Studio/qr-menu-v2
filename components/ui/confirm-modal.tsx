"use client"

import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
}: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-110 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative z-110 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 w-fit rounded-full bg-red-50 p-3 text-red-600">
                            <AlertTriangle className="h-6 w-6" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
                            <p className="text-sm leading-6 text-slate-500">{description}</p>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
                            >
                                İptal
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                className="rounded-xl bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
                            >
                                Sil
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    )
}
