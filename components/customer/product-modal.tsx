"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BadgeCheck, Flame, Leaf, WheatOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface Product {
    id: string
    name: string
    description: string
    price: number
    image: string
    category?: string
    badges?: string[]
    popular?: boolean
    isSoldOut?: boolean
    ingredients?: string[]
    nutrition?: {
        calories: string
        protein: string
        carbs: string
    }
}

interface ProductModalProps {
    product: Product | null
    currencySymbol: string
    onClose: () => void
}

const sheetTransition = {
    type: "spring" as const,
    bounce: 0,
    duration: 0.4,
}

function getBadgeIcon(badge: string) {
    if (badge.toLowerCase().includes("vegan")) {
        return <Leaf className="h-3.5 w-3.5" />
    }

    if (badge.toLowerCase().includes("gluten") || badge.toLowerCase().includes("glüt")) {
        return <WheatOff className="h-3.5 w-3.5" />
    }

    return <BadgeCheck className="h-3.5 w-3.5" />
}

export function ProductModal({ product, currencySymbol, onClose }: ProductModalProps) {
    useEffect(() => {
        if (!product) return

        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        return () => {
            document.body.style.overflow = originalOverflow
        }
    }, [product])

    const ingredients = product?.ingredients ?? ["Özel sos", "Taze otlar", "Mevsimlik dokunuş"]
    const nutrition = product?.nutrition ?? {
        calories: "220 kcal",
        protein: "12 g",
        carbs: "18 g",
    }

    return (
        <AnimatePresence>
            {product ? (
                <>
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="product-modal-title"
                        className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[90vh] overflow-y-auto rounded-t-[2.5rem] bg-card text-card-foreground"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={sheetTransition}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mx-auto w-full max-w-2xl px-4 pb-6">
                            <div className="mx-auto mb-2 mt-4 h-1.5 w-12 rounded-full bg-border" />

                            <div className="relative mt-4 h-64 w-full overflow-hidden rounded-2xl bg-muted">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className={`h-full w-full object-cover ${product.isSoldOut ? "grayscale opacity-60" : ""}`}
                                    crossOrigin="anonymous"
                                />
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: "linear-gradient(to top, rgba(2, 6, 23, 0.5), transparent)",
                                    }}
                                />
                                <AnimatePresence>
                                    {product.isSoldOut && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px]"
                                        >
                                            <span className="rounded-full border border-white/20 bg-black/60 px-4 py-2 text-sm font-bold tracking-[0.28em] text-white">
                                                TÜKENDİ
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    onClick={onClose}
                                    className="absolute right-4 top-4 h-10 w-10 rounded-full bg-card/90 text-card-foreground shadow-lg backdrop-blur hover:bg-card"
                                    aria-label="Ürün detaylarını kapat"
                                >
                                    <X className="h-5 w-5" />
                                </Button>

                                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                    <Flame className="h-3.5 w-3.5" />
                                    Özel Seçim
                                </div>
                            </div>

                            <div className="space-y-6 pt-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                                            Öne Çıkan Lezzet
                                        </p>
                                        <h2 id="product-modal-title" className="text-2xl font-bold tracking-tight text-card-foreground">
                                            {product.name}
                                        </h2>
                                        {product.isSoldOut && (
                                            <span className="mt-2 inline-flex rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                                Tükendi
                                            </span>
                                        )}
                                    </div>

                                    <div className={`rounded-2xl px-4 py-2 text-lg font-bold shadow-sm ${product.isSoldOut ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}>
                                        {currencySymbol}{product.price}
                                    </div>
                                </div>

                                <p className="text-sm leading-6 text-muted-foreground">
                                    {product.description}
                                </p>

                                {product.badges && product.badges.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {product.badges.map((badge) => (
                                            <span
                                                key={badge}
                                                className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground"
                                            >
                                                {getBadgeIcon(badge)}
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <section className="space-y-3 rounded-2xl bg-muted p-4">
                                    <h3 className="text-sm font-semibold text-card-foreground">İçindekiler</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {ingredients.map((item) => (
                                            <span
                                                key={item}
                                                className="rounded-full bg-card px-3 py-1 text-xs font-medium text-card-foreground shadow-sm ring-1 ring-border"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="text-sm font-semibold text-card-foreground">Besin Değerleri</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: "Kalori", value: nutrition.calories },
                                            { label: "Protein", value: nutrition.protein },
                                            { label: "Karbonhidrat", value: nutrition.carbs },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="rounded-2xl border border-border bg-card px-3 py-4 text-center shadow-sm"
                                            >
                                                <p className="text-xs text-muted-foreground">{item.label}</p>
                                                <p className="mt-1 text-sm font-semibold text-card-foreground">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="sticky bottom-0 mt-6 border-t border-border bg-card/95 py-4 backdrop-blur">
                                <Button
                                    disabled={Boolean(product.isSoldOut)}
                                    className="h-14 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
                                >
                                    {product.isSoldOut ? "Mevcut Değil" : "Siparişe Ekle"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            ) : null}
        </AnimatePresence>
    )
}
