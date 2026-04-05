"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ProductModal } from "@/components/customer/product-modal"
import { PremiumBanner } from "@/components/customer/premium-banner"
import { OpeningPopup } from "@/components/customer/opening-popup"
import type { MenuCategory, MenuProduct, MenuSettings } from "@/lib/menu-data"

// Re-export so the modal type stays compatible
export type { MenuProduct as MenuProductType }

interface CustomerMenuProps {
  settings: MenuSettings
  categories: MenuCategory[]
}

export function CustomerMenu({ settings, categories }: CustomerMenuProps) {
  const router = useRouter()
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categories[0]?.id ?? ""
  )
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null)

  const activeCategory = categories.find((c) => c.id === activeCategoryId)

  // Map MenuProduct to the shape ProductModal expects
  const toModalProduct = (p: MenuProduct) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.image,
    isSoldOut: p.isSoldOut,
  })

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <OpeningPopup
        isPopupActive={settings.isPopupActive}
        popupImage={settings.popupImage}
        popupTitle={settings.popupTitle}
        popupMessage={settings.popupMessage}
      />
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="h-10 w-10 rounded-xl"
            aria-label="Ana sayfaya dön"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2.5">
            {settings.logo ? (
              <img
                src={settings.logo}
                alt={settings.restaurantName}
                className="h-8 w-8 rounded-lg object-cover"
                crossOrigin="anonymous"
              />
            ) : null}
            <div>
              <h1 className="text-base font-semibold leading-tight">
                {settings.restaurantName}
              </h1>
              {settings.slogan && (
                <p className="text-xs text-muted-foreground">{settings.slogan}</p>
              )}
            </div>
          </div>
        </div>

        {/* Campaign banner */}
        {settings.bannerImage && (
          <PremiumBanner
            imageUrl={settings.bannerImage}
            title={settings.bannerTitle}
            description={settings.bannerDescription}
          />
        )}

        {/* Category pills */}
        {categories.length > 0 && (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 px-4 pb-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${activeCategoryId === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        )}
      </header>

      {/* ── Main ── */}
      <main className="flex-1 px-4 py-4">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">Henüz kategori yok</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Menü yakın zamanda güncelleniyor.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategoryId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              {(activeCategory?.products ?? []).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => !product.isSoldOut && setSelectedProduct(product)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !product.isSoldOut) {
                      e.preventDefault()
                      setSelectedProduct(product)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${product.name} detayları`}
                  aria-disabled={product.isSoldOut}
                  className={`group overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all ${product.isSoldOut
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer hover:border-primary/20 hover:shadow-md active:scale-[0.99]"
                    }`}
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`h-full w-full object-cover transition-transform duration-300 ${product.isSoldOut
                            ? "grayscale opacity-50"
                            : "group-hover:scale-105"
                            }`}
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}

                      <AnimatePresence>
                        {product.isSoldOut && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[1px]"
                          >
                            <span className="rounded-full border border-white/20 bg-black/60 px-2 py-1 text-[10px] font-bold tracking-[0.2em] text-white">
                              TÜKENDİ
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold leading-tight text-card-foreground">
                            {product.name}
                          </h3>
                          {product.isSoldOut && (
                            <span className="shrink-0 rounded-full bg-slate-900/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                              Tükendi
                            </span>
                          )}
                        </div>
                        {product.description && (
                          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex shrink-0 flex-col items-end justify-between">
                      <p
                        className={`text-lg font-bold ${product.isSoldOut
                          ? "text-muted-foreground line-through"
                          : "text-card-foreground"
                          }`}
                      >
                        {product.price} {settings.currencySymbol}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {(activeCategory?.products.length ?? 0) === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Bu kategoride ürün yok</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <ProductModal
        product={selectedProduct ? toModalProduct(selectedProduct) : null}
        currencySymbol={settings.currencySymbol}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  )
}

