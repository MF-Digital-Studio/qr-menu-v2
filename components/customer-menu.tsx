"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Leaf, WheatOff, Flame, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ProductModal, type Product } from "@/components/customer/product-modal"
import { PremiumBanner } from "@/components/customer/premium-banner"

interface CustomerMenuProps {
  onBack?: () => void
}

const categories = [
  { id: "popular", name: "Popüler", icon: Star },
  { id: "hot-drinks", name: "Sıcak İçecekler", icon: Flame },
  { id: "cold-drinks", name: "Soğuk İçecekler", icon: null },
  { id: "mains", name: "Ana Yemekler", icon: null },
  { id: "desserts", name: "Tatlılar", icon: null },
  { id: "snacks", name: "Atıştırmalıklar", icon: null },
]

type ProductType = Product

const campaignImageUrl: string | null = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&q=80"

const products: ProductType[] = [
  {
    id: 1,
    name: "Espresso Classico",
    description: "Yoğun ve karakterli tek köken espresso shot",
    price: 32,
    category: "hot-drinks",
    image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=200&h=200&fit=crop",
    badges: [],
    popular: true,
    isSoldOut: false,
  },
  {
    id: 2,
    name: "Avocado Toast",
    description: "Ekşi mayalı ekmek, ezilmiş avokado, poşe yumurta ve mikro filizler",
    price: 68,
    category: "mains",
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=200&h=200&fit=crop",
    badges: ["Vegan Seçenek"],
    popular: true,
    isSoldOut: false,
  },
  {
    id: 3,
    name: "Matcha Latte",
    description: "Seremoni kalitesinde matcha, yulaf sütü ve bal",
    price: 48,
    category: "hot-drinks",
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=200&h=200&fit=crop",
    badges: ["Vegan"],
    popular: true,
    isSoldOut: false,
  },
  {
    id: 4,
    name: "Tiramisu",
    description: "Mascarpone ve espresso ile hazırlanan klasik İtalyan tatlısı",
    price: 55,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=200&fit=crop",
    badges: [],
    popular: false,
    isSoldOut: true,
  },
  {
    id: 5,
    name: "Açai Bowl",
    description: "Taze açai, granola, muz, orman meyveleri ve hindistan cevizi",
    price: 62,
    category: "mains",
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200&h=200&fit=crop",
    badges: ["Vegan", "Glütensiz"],
    popular: true,
    isSoldOut: false,
  },
  {
    id: 6,
    name: "Cold Brew",
    description: "24 saat demlenmiş, yumuşak içimli ve ferahlatıcı cold brew",
    price: 38,
    category: "cold-drinks",
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=200&h=200&fit=crop",
    badges: [],
    popular: false,
    isSoldOut: true,
  },
  {
    id: 7,
    name: "Croissant",
    description: "Tereyağlı, günlük pişmiş Fransız kruvasanı",
    price: 28,
    category: "snacks",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop",
    badges: [],
    popular: false,
    isSoldOut: false,
  },
  {
    id: 8,
    name: "Cappuccino",
    description: "Double espresso, buharla ısıtılmış süt ve kadifemsi köpük",
    price: 36,
    category: "hot-drinks",
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200&h=200&fit=crop",
    badges: [],
    popular: true,
    isSoldOut: false,
  },
]

export function CustomerMenu({ onBack }: CustomerMenuProps) {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState("popular")
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null)

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }

    router.push("/")
  }

  const filteredProducts = activeCategory === "popular"
    ? products.filter(p => p.popular)
    : products.filter(p => p.category === activeCategory)

  const getBadgeIcon = (badge: string) => {
    if (badge.toLowerCase().includes("vegan")) return <Leaf className="h-3 w-3" />
    if (badge.toLowerCase().includes("gluten") || badge.toLowerCase().includes("glüt")) return <WheatOff className="h-3 w-3" />
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Menü</h1>
            <p className="text-xs text-muted-foreground">MF Digital Cafe</p>
          </div>
        </div>

        {/* Premium Campaign Banner */}
        <PremiumBanner imageUrl={campaignImageUrl} />

        {/* Category Navigation */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 px-4 pb-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
              >
                {category.icon && <category.icon className="h-3.5 w-3.5" />}
                {category.name}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </header>

      {/* Product List */}
      <main className="flex-1 px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedProduct(product)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    setSelectedProduct(product)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${product.name} detayları`}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/20 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${product.isSoldOut ? "grayscale opacity-60" : ""}`}
                      crossOrigin="anonymous"
                    />
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

                  {/* Product Info */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold leading-tight text-card-foreground">
                          {product.name}
                        </h3>
                        {product.isSoldOut && (
                          <span className="rounded-full bg-slate-900/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                            Stokta Yok
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                        {product.description}
                      </p>
                    </div>

                    {/* Badges */}
                    {(product.badges?.length ?? 0) > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {product.badges?.map((badge) => (
                          <Badge
                            key={badge}
                            variant="secondary"
                            className="gap-1 rounded-md px-2 py-0.5 text-xs font-normal"
                          >
                            {getBadgeIcon(badge)}
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex flex-col items-end justify-between">
                    <p className={`text-lg font-bold ${product.isSoldOut ? "text-muted-foreground" : "text-card-foreground"}`}>
                      ₺{product.price}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <X className="h-8 w-8 text-muted-foreground" />
            </div>
                <p className="text-muted-foreground">Bu kategoride ürün bulunamadı</p>
          </div>
        )}
      </main>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-4">
        <p className="text-center text-xs text-muted-foreground">
          <span className="font-medium">MF Digital Studio</span> tarafından tutkuyla hazırlandı
        </p>
      </footer>
    </div>
  )
}
