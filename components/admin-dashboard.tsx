"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  ChevronDown,
  Edit2,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ImageUploadField } from "@/components/ui/image-upload-field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/context/toast-context"
import { handleImageUpload } from "@/lib/upload-image"
import {
  deleteProductAction,
  toggleSoldOutAction,
  upsertProductAction,
  type CategoryOption,
} from "@/app/actions/product-actions"

type ProductStatus = "active" | "draft"

export interface AdminProduct {
  id: string
  name: string
  categoryId: string
  categoryName: string
  price: number
  status: ProductStatus
  image: string
  description: string
  isSoldOut: boolean
}

interface AddProductFormState {
  name: string
  categoryId: string
  price: string
  status: ProductStatus
  description: string
  image: string
}

interface AddProductModalProps {
  isOpen: boolean
  editingProduct: AdminProduct | null
  onClose: () => void
  onSave: (product: Omit<AdminProduct, "id">) => Promise<void>
  categories: CategoryOption[]
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80"

function AddProductModal({
  isOpen,
  editingProduct,
  onClose,
  onSave,
  categories,
}: AddProductModalProps) {
  const { addToast } = useToast()
  const defaultCategoryId = categories[0]?.id ?? ""

  const blankForm = (): AddProductFormState => ({
    name: "",
    categoryId: defaultCategoryId,
    price: "",
    status: "active",
    description: "",
    image: "",
  })

  const [formData, setFormData] = useState<AddProductFormState>(blankForm)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const resetPreview = (nextUrl = "") => {
    setPreviewUrl((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current)
      return nextUrl
    })
  }

  useEffect(() => {
    if (!isOpen) {
      setFormData(blankForm())
      setSelectedImageFile(null)
      resetPreview("")
      setIsUploading(false)
      return
    }

    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        categoryId: editingProduct.categoryId,
        price: String(editingProduct.price),
        status: editingProduct.status,
        description: editingProduct.description,
        image: editingProduct.image,
      })
      setSelectedImageFile(null)
      resetPreview(editingProduct.image)
      return
    }

    setFormData(blankForm())
    setSelectedImageFile(null)
    resetPreview("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingProduct, defaultCategoryId])

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const updateField = <K extends keyof AddProductFormState>(
    field: K,
    value: AddProductFormState[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSelectedFile = (file: File | null) => {
    if (!file) return

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      addToast("Sadece JPEG, PNG veya WEBP görseller yüklenebilir.", "error")
      return
    }

    setSelectedImageFile(file)
    resetPreview(URL.createObjectURL(file))
  }

  const handleClose = () => {
    if (isUploading) return
    setFormData(blankForm())
    setSelectedImageFile(null)
    resetPreview("")
    onClose()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsUploading(true)

    try {
      let imageUrl = formData.image.trim() || editingProduct?.image || FALLBACK_IMAGE

      if (selectedImageFile) {
        imageUrl = await handleImageUpload(selectedImageFile)
        addToast("Görsel yüklendi", "success")
      }

      const selectedCategory = categories.find((c) => c.id === formData.categoryId)

      await onSave({
        name: formData.name.trim() || "Yeni Ürün",
        categoryId: formData.categoryId,
        categoryName: selectedCategory?.name ?? "",
        price: Number(formData.price) || 0,
        status: formData.status,
        description: formData.description.trim(),
        image: imageUrl,
        isSoldOut: editingProduct?.isSoldOut ?? false,
      })
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Görsel yüklenirken bir hata oluştu.",
        "error",
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingProduct
                    ? "Premium menü düzenini koruyarak ürün detaylarını güncelleyin."
                    : "Menü için şık ve profesyonel bir ürün kartı oluşturun."}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClose}
                disabled={isUploading}
                className="rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Ürün Adı</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="İmza Latte"
                    className="mt-2 rounded-lg border-gray-200"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Kategori</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => updateField("categoryId", e.target.value)}
                    className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-black/10"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Fiyat</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    placeholder="49"
                    className="mt-2 rounded-lg border-gray-200"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Durum</label>
                  <select
                    value={formData.status}
                    onChange={(e) => updateField("status", e.target.value as ProductStatus)}
                    className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-black/10"
                  >
                    <option value="active">Aktif</option>
                    <option value="draft">Taslak</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Kısa ve şık bir ürün açıklaması yazın..."
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-black/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <ImageUploadField
                    label="Ürün Görseli"
                    previewUrl={previewUrl || formData.image}
                    inputId="product-image-upload"
                    onFileSelect={handleSelectedFile}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isUploading}
                  className="rounded-lg"
                >
                  Iptal
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="rounded-lg bg-black text-white hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isUploading
                    ? "Görsel Yükleniyor..."
                    : editingProduct
                      ? "Değişiklikleri Kaydet"
                      : "Ürünü Kaydet"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

interface AdminDashboardProps {
  products: AdminProduct[]
  categories: CategoryOption[]
  currencySymbol?: string
}

export function AdminDashboard({ products, categories, currencySymbol = "₺" }: AdminDashboardProps) {
  const { addToast } = useToast()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch =
      query.length === 0 ||
      product.name.toLowerCase().includes(query) ||
      product.categoryName.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)

    const matchesCategory = categoryFilter === "all" || product.categoryId === categoryFilter
    const matchesStatus = statusFilter === "All" || product.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const productPendingDelete = products.find((p) => p.id === itemToDelete) ?? null

  const handleOpenAddModal = () => {
    setEditingProduct(null)
    setIsAddModalOpen(true)
  }

  const handleOpenEditModal = (product: AdminProduct) => {
    setEditingProduct(product)
    setIsAddModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsAddModalOpen(false)
    setEditingProduct(null)
  }

  const handleSaveProduct = async (productData: Omit<AdminProduct, "id">) => {
    const result = await upsertProductAction({
      id: editingProduct?.id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      image: productData.image,
      categoryId: productData.categoryId,
      isActive: productData.status === "active",
      isSoldOut: productData.isSoldOut,
    })

    if (result.error) {
      addToast(result.error, "error")
      return
    }

    addToast(editingProduct ? "Ürün güncellendi" : "Ürün eklendi", "success")
    handleCloseModal()
    startTransition(() => router.refresh())
  }

  const handleDeleteProduct = (id: string) => {
    setItemToDelete(id)
  }

  const confirmDeleteProduct = () => {
    if (!itemToDelete) return
    const id = itemToDelete
    setItemToDelete(null)

    startTransition(async () => {
      const result = await deleteProductAction(id)
      if (result.error) {
        addToast(result.error, "error")
      } else {
        addToast("Ürün silindi", "success")
        router.refresh()
      }
    })
  }

  const handleToggleSoldOut = (productId: string, isSoldOut: boolean) => {
    const targetProduct = products.find((p) => p.id === productId)

    startTransition(async () => {
      const result = await toggleSoldOutAction(productId, isSoldOut)
      if (result.error) {
        addToast(result.error, "error")
      } else {
        addToast(
          isSoldOut
            ? `${targetProduct?.name ?? "Ürün"} tükendi olarak işaretlendi`
            : `${targetProduct?.name ?? "Ürün"} yeniden satışa açıldı`,
          "info",
        )
        router.refresh()
      }
    })
  }

  return (
    <section className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 pl-16 backdrop-blur-sm lg:pl-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Yönetim / Katalog</p>
          <h1 className="text-xl font-bold tracking-tight">Ürünler</h1>
        </div>
        <Button
          onClick={handleOpenAddModal}
          disabled={isPending}
          className="gap-2 rounded-xl whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Yeni Ürün Ekle</span>
          <span className="sm:hidden">Yeni</span>
        </Button>
      </header>

      <main className="flex-1 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-6xl"
        >
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ürünlerde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl pl-10"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-10 min-w-40 appearance-none rounded-xl border border-border bg-card px-3 pr-9 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-black/10"
                >
                  <option value="all">Tüm Kategoriler</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 min-w-32 appearance-none rounded-xl border border-border bg-card px-3 pr-9 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-black/10"
                >
                  <option value="All">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="draft">Taslak</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-20">Görsel</TableHead>
                  <TableHead>Ürün Adı</TableHead>
                  <TableHead className="hidden md:table-cell">Kategori</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead className="hidden sm:table-cell">Durum</TableHead>
                  <TableHead className="hidden md:table-cell">Stok Durumu</TableHead>
                  <TableHead className="w-20 text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`group border-b border-border transition-colors hover:bg-zinc-50/50 ${product.isSoldOut ? "opacity-70" : ""}`}
                  >
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded-xl bg-muted">
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`h-full w-full object-cover ${product.isSoldOut ? "grayscale" : ""}`}
                          crossOrigin="anonymous"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.name}</span>
                        {product.isSoldOut && (
                          <Badge className="rounded-full bg-slate-900 text-[10px] uppercase tracking-wide text-white hover:bg-slate-900">
                            Tükendi
                          </Badge>
                        )}
                      </div>
                      <span className="block text-xs text-muted-foreground md:hidden">
                        {product.categoryName}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {product.categoryName}
                    </TableCell>
                    <TableCell
                      className={`font-medium ${product.isSoldOut ? "text-muted-foreground" : ""}`}
                    >
                      {product.price} {currencySymbol}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={product.status === "active" ? "default" : "secondary"}
                        className={`rounded-md ${product.status === "active"
                          ? "bg-success/10 text-success hover:bg-success/20"
                          : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {product.status === "active" ? "Aktif" : "Taslak"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={product.isSoldOut}
                          onCheckedChange={(checked) =>
                            handleToggleSoldOut(product.id, checked)
                          }
                          disabled={isPending}
                          aria-label={`${product.name} stok durumu`}
                          className="cursor-pointer"
                        />
                        <span
                          className={`text-xs font-medium ${product.isSoldOut ? "text-amber-700" : "text-muted-foreground"}`}
                        >
                          {product.isSoldOut ? "Tükendi" : "Stokta"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isPending}
                            className="h-8 w-8 rounded-lg opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                          <DropdownMenuItem
                            onClick={() => handleOpenEditModal(product)}
                            className="cursor-pointer gap-2 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteProduct(product.id)}
                            className="cursor-pointer gap-2 rounded-lg text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>

            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Eşleşen ürün bulunamadı</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Toplam{" "}
              <span className="font-medium text-foreground">{products.length}</span> ürünün{" "}
              <span className="font-medium text-foreground">{filteredProducts.length}</span>{" "}
              tanesi gösteriliyor
            </p>
          </div>
        </motion.div>
      </main>

      <AddProductModal
        isOpen={isAddModalOpen}
        editingProduct={editingProduct}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        categories={categories}
      />

      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDeleteProduct}
        title="Ürün silinsin mi?"
        description={
          productPendingDelete
            ? `${productPendingDelete.name} menüden kalıcı olarak kaldırılacak.`
            : "Bu işlem geri alınamaz."
        }
      />
    </section>
  )
}
