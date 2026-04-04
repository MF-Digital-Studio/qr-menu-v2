"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion, Reorder, useDragControls } from "framer-motion"
import { Edit2, FolderOpen, GripVertical, Plus, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { ImageUploadField } from "@/components/ui/image-upload-field"
import { Input } from "@/components/ui/input"
import { useToast } from "@/context/toast-context"
import { handleImageUpload } from "@/lib/upload-image"

type CategoryStatus = "Active" | "Hidden"

interface Category {
    id: number
    name: string
    slug: string
    image: string
    productCount: number
    status: CategoryStatus
}

interface AddCategoryFormState {
    name: string
    slug: string
    image: string
    status: CategoryStatus
}

interface AddCategoryModalProps {
    isOpen: boolean
    editingCategory: Category | null
    onClose: () => void
    onSave: (category: Omit<Category, "id">) => void
}

interface CategoryRowProps {
    category: Category
    onEdit: (category: Category) => void
    onDelete: (id: number) => void
}

const initialCategories: Category[] = [
    {
        id: 1,
        name: "Sıcak İçecekler",
        slug: "/hot-drinks",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80",
        productCount: 8,
        status: "Active",
    },
    {
        id: 2,
        name: "Soğuk İçecekler",
        slug: "/cold-drinks",
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=200&q=80",
        productCount: 5,
        status: "Active",
    },
    {
        id: 3,
        name: "Tatlılar",
        slug: "/desserts",
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=200&q=80",
        productCount: 6,
        status: "Active",
    },
    {
        id: 4,
        name: "Sezon Seçkileri",
        slug: "/seasonal-specials",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=200&q=80",
        productCount: 3,
        status: "Hidden",
    },
]

const emptyFormState: AddCategoryFormState = {
    name: "",
    slug: "",
    image: "",
    status: "Active",
}

function AddCategoryModal({ isOpen, editingCategory, onClose, onSave }: AddCategoryModalProps) {
    const { addToast } = useToast()
    const [formData, setFormData] = useState<AddCategoryFormState>(emptyFormState)
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState("")
    const [isUploading, setIsUploading] = useState(false)

    const resetPreview = (nextUrl = "") => {
        setPreviewUrl((currentUrl) => {
            if (currentUrl.startsWith("blob:")) {
                URL.revokeObjectURL(currentUrl)
            }

            return nextUrl
        })
    }

    useEffect(() => {
        if (!isOpen) {
            setFormData(emptyFormState)
            setSelectedImageFile(null)
            resetPreview("")
            setIsUploading(false)
            return
        }

        if (editingCategory) {
            setFormData({
                name: editingCategory.name,
                slug: editingCategory.slug,
                image: editingCategory.image,
                status: editingCategory.status,
            })
            setSelectedImageFile(null)
            resetPreview(editingCategory.image)
            return
        }

        setFormData(emptyFormState)
        setSelectedImageFile(null)
        resetPreview("")
    }, [editingCategory, isOpen])

    useEffect(() => {
        return () => {
            if (previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const updateField = <K extends keyof AddCategoryFormState>(
        field: K,
        value: AddCategoryFormState[K],
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSelectedFile = (file: File | null) => {
        if (!file) {
            return
        }

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            addToast("Sadece JPEG, PNG veya WEBP görseller yüklenebilir.", "error")
            return
        }

        setSelectedImageFile(file)
        resetPreview(URL.createObjectURL(file))
    }

    const handleClose = () => {
        if (isUploading) {
            return
        }

        setFormData(emptyFormState)
        setSelectedImageFile(null)
        resetPreview("")
        onClose()
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsUploading(true)

        const safeName = formData.name.trim() || "Yeni Kategori"
        const generatedSlug =
            formData.slug.trim() ||
            `/${safeName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")}`

        try {
            let uploadedImageUrl =
                formData.image.trim() ||
                editingCategory?.image ||
                "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80"

            if (selectedImageFile) {
                uploadedImageUrl = await handleImageUpload(selectedImageFile)
                addToast("Başarıyla yüklendi", "success")
            }

            onSave({
                name: safeName,
                slug: generatedSlug.startsWith("/") ? generatedSlug : `/${generatedSlug}`,
                image: uploadedImageUrl,
                productCount: editingCategory?.productCount ?? 0,
                status: formData.status,
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
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                    {editingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Menü yapınız için şık bir katalog bölümü oluşturun veya güncelleyin.
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
                                    <label className="text-sm font-medium text-slate-700">Kategori Adı</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(event) => updateField("name", event.target.value)}
                                        placeholder="Sıcak İçecekler"
                                        className="mt-2 rounded-lg border-gray-200"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Slug</label>
                                    <Input
                                        value={formData.slug}
                                        onChange={(event) => updateField("slug", event.target.value)}
                                        placeholder="/hot-drinks"
                                        className="mt-2 rounded-lg border-gray-200"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <ImageUploadField
                                        label="Kategori Görseli"
                                        previewUrl={previewUrl || formData.image}
                                        inputId="category-image-upload"
                                        onFileSelect={handleSelectedFile}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Durum</label>
                                    <select
                                        value={formData.status}
                                        onChange={(event) => updateField("status", event.target.value as CategoryStatus)}
                                        className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-black/10"
                                    >
                                        <option value="Active">Aktif</option>
                                        <option value="Hidden">Gizli</option>
                                    </select>
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
                                    İptal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isUploading}
                                    className="rounded-lg bg-black text-white hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isUploading
                                        ? "Görsel Yükleniyor..."
                                        : editingCategory
                                            ? "Değişiklikleri Kaydet"
                                            : "Kategoriyi Kaydet"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    )
}

function CategoryRow({ category, onEdit, onDelete }: CategoryRowProps) {
    const dragControls = useDragControls()

    return (
        <Reorder.Item
            value={category}
            dragListener={false}
            dragControls={dragControls}
            whileDrag={{ scale: 1.01, boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)" }}
            className="grid grid-cols-[64px_88px_minmax(220px,1fr)_140px_120px_140px] items-center gap-4 bg-card px-4 py-3 transition-colors hover:bg-zinc-50/50"
        >
            <div>
                <button
                    type="button"
                    onPointerDown={(event) => dragControls.start(event)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-muted hover:text-gray-600"
                    aria-label={`${category.name} sırasını değiştir`}
                >
                    <GripVertical className="h-4 w-4 cursor-grab" />
                </button>
            </div>

            <div>
                <div className="h-12 w-12 overflow-hidden rounded-xl bg-muted">
                    <Image
                        src={category.image}
                        alt={category.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                    />
                </div>
            </div>

            <div>
                <p className="font-medium text-foreground">{category.name}</p>
                <p className="text-xs text-muted-foreground">{category.slug}</p>
            </div>

            <div>
                <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-600">
                    {category.productCount} ürün
                </Badge>
            </div>

            <div>
                <Badge
                    variant="secondary"
                    className={
                        category.status === "Active"
                            ? "rounded-full bg-emerald-500/10 text-emerald-700"
                            : "rounded-full bg-slate-100 text-slate-600"
                    }
                >
                    {category.status === "Active" ? "Aktif" : "Gizli"}
                </Badge>
            </div>

            <div className="flex items-center justify-end gap-3 text-sm">
                <button
                    type="button"
                    onClick={() => onEdit(category)}
                    className="inline-flex items-center gap-1 text-slate-600 transition hover:text-slate-900"
                >
                    <Edit2 className="h-4 w-4" />
                    Düzenle
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(category.id)}
                    className="inline-flex items-center gap-1 text-red-500 transition hover:text-red-600"
                >
                    <Trash2 className="h-4 w-4" />
                    Sil
                </button>
            </div>
        </Reorder.Item>
    )
}

export default function CategoriesPage() {
    const { addToast } = useToast()
    const [categories, setCategories] = useState<Category[]>(initialCategories)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)

    const handleOpenAddModal = () => {
        setEditingCategory(null)
        setIsAddModalOpen(true)
    }

    const handleOpenEditModal = (category: Category) => {
        setEditingCategory(category)
        setIsAddModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsAddModalOpen(false)
        setEditingCategory(null)
    }

    const handleSaveCategory = (categoryData: Omit<Category, "id">) => {
        const isEditing = Boolean(editingCategory)

        setCategories((prev) => {
            if (editingCategory) {
                return prev.map((category) =>
                    category.id === editingCategory.id ? { ...category, ...categoryData } : category,
                )
            }

            return [{ id: Date.now(), ...categoryData }, ...prev]
        })

        addToast(isEditing ? "Kategori güncellendi" : "Kategori eklendi", "success")
        handleCloseModal()
    }

    const handleDelete = (id: number) => {
        setItemToDelete(String(id))
    }

    const confirmDeleteCategory = () => {
        if (!itemToDelete) {
            return
        }

        setCategories((prev) => prev.filter((category) => String(category.id) !== itemToDelete))
        addToast("Kategori silindi", "success")
        setItemToDelete(null)
    }

    const categoryPendingDelete = categories.find((category) => String(category.id) === itemToDelete) ?? null

    return (
        <section className="min-h-screen bg-background">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 pl-16 backdrop-blur-sm lg:pl-6">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Yönetim / Katalog</p>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Kategoriler</h1>
                </div>

                <Button
                    onClick={handleOpenAddModal}
                    className="gap-2 rounded-xl px-4 text-white whitespace-nowrap"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Yeni Kategori Ekle</span>
                    <span className="sm:hidden">Yeni</span>
                </Button>
            </header>

            <main className="p-6">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl">
                    <div className="mb-4 flex justify-end">
                        <p className="text-sm text-muted-foreground">
                            Tutuş noktasını sürükleyerek kategorilerin sırasını yerel olarak değiştirebilirsiniz.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="overflow-x-auto">
                            <div className="min-w-205">
                                <div className="grid grid-cols-[64px_88px_minmax(220px,1fr)_140px_120px_140px] items-center gap-4 border-b border-border bg-muted/40 px-4 py-3 text-sm font-medium text-muted-foreground">
                                    <div>Sıra</div>
                                    <div>Görsel</div>
                                    <div>Kategori Detayı</div>
                                    <div>Ürün</div>
                                    <div>Durum</div>
                                    <div className="text-right">İşlemler</div>
                                </div>

                                {categories.length > 0 ? (
                                    <Reorder.Group axis="y" values={categories} onReorder={setCategories} as="div" className="divide-y divide-border">
                                        {categories.map((category) => (
                                            <CategoryRow
                                                key={category.id}
                                                category={category}
                                                onEdit={handleOpenEditModal}
                                                onDelete={handleDelete}
                                            />
                                        ))}
                                    </Reorder.Group>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                            <FolderOpen className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground">Henüz kategori eklenmedi</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                        <p>
                            Toplam <span className="font-medium text-foreground">{categories.length}</span> kategori gösteriliyor
                        </p>
                    </div>
                </motion.div>
            </main>

            <AddCategoryModal
                isOpen={isAddModalOpen}
                editingCategory={editingCategory}
                onClose={handleCloseModal}
                onSave={handleSaveCategory}
            />

            <ConfirmModal
                isOpen={Boolean(itemToDelete)}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDeleteCategory}
                title="Kategori silinsin mi?"
                description={categoryPendingDelete
                    ? `${categoryPendingDelete.name} katalogtan kalıcı olarak kaldırılacak.`
                    : "Bu işlem geri alınamaz."}
            />
        </section>
    )
}
