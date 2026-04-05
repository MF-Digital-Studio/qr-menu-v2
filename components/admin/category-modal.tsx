"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ImageUploadField } from "@/components/ui/image-upload-field"
import { Input } from "@/components/ui/input"
import { upsertCategoryAction, type CategoryRow } from "@/app/actions/category-actions"
import { handleImageUpload } from "@/lib/upload-image"

interface CategoryModalProps {
    isOpen: boolean
    editingCategory: CategoryRow | null
    onClose: () => void
    onSuccess: () => void
}

interface FormState {
    name: string
    slug: string
    order: string
    image: string
    isActive: boolean
}

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80"

function slugify(name: string) {
    return name
        .toLowerCase()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
}

function blank(nextOrder: number): FormState {
    return { name: "", slug: "", order: String(nextOrder), image: "", isActive: true }
}

export function CategoryModal({
    isOpen,
    editingCategory,
    onClose,
    onSuccess,
}: CategoryModalProps) {
    const nextOrder = editingCategory?.order ?? 0
    const [form, setForm] = useState<FormState>(blank(nextOrder))
    const [slugManual, setSlugManual] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState("")
    const [isUploading, setIsUploading] = useState(false)

    const resetPreview = (next = "") => {
        setPreviewUrl((cur) => {
            if (cur.startsWith("blob:")) URL.revokeObjectURL(cur)
            return next
        })
    }

    useEffect(() => {
        if (!isOpen) {
            setForm(blank(0))
            setSlugManual(false)
            setSelectedFile(null)
            resetPreview("")
            setIsUploading(false)
            return
        }

        if (editingCategory) {
            setForm({
                name: editingCategory.name,
                slug: editingCategory.slug,
                order: String(editingCategory.order),
                image: editingCategory.image,
                isActive: editingCategory.isActive,
            })
            setSlugManual(true)
            resetPreview(editingCategory.image)
        } else {
            setForm(blank(0))
            setSlugManual(false)
            resetPreview("")
        }
    }, [isOpen, editingCategory])

    useEffect(() => {
        return () => {
            if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    const updateName = (name: string) => {
        setForm((prev) => ({
            ...prev,
            name,
            slug: slugManual ? prev.slug : slugify(name),
        }))
    }

    const updateSlug = (slug: string) => {
        setSlugManual(true)
        setForm((prev) => ({ ...prev, slug }))
    }

    const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleFileSelect = (file: File | null) => {
        if (!file) return
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            toast.error("Sadece JPEG, PNG veya WEBP görseller yüklenebilir.")
            return
        }
        setSelectedFile(file)
        resetPreview(URL.createObjectURL(file))
    }

    const handleClose = () => {
        if (isUploading) return
        onClose()
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsUploading(true)

        try {
            let imageUrl = form.image.trim() || editingCategory?.image || FALLBACK_IMAGE

            if (selectedFile) {
                imageUrl = await handleImageUpload(selectedFile)
            }

            const result = await upsertCategoryAction({
                id: editingCategory?.id,
                name: form.name.trim(),
                slug: form.slug.trim() || slugify(form.name),
                image: imageUrl,
                order: Number(form.order) || 0,
                isActive: form.isActive,
            })

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success(editingCategory ? "Kategori güncellendi" : "Kategori eklendi")
            onSuccess()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Bir hata oluştu.")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
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
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
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

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* Name */}
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Kategori Adı</label>
                                    <Input
                                        value={form.name}
                                        onChange={(e) => updateName(e.target.value)}
                                        placeholder="Sıcak İçecekler"
                                        className="mt-2 rounded-lg border-gray-200"
                                        required
                                    />
                                </div>

                                {/* Slug */}
                                <div>
                                    <label className="text-sm font-medium text-slate-700">
                                        Slug{" "}
                                        <span className="font-normal text-slate-400">(otomatik oluşturulur)</span>
                                    </label>
                                    <Input
                                        value={form.slug}
                                        onChange={(e) => updateSlug(e.target.value)}
                                        placeholder="sicak-icecekler"
                                        className="mt-2 rounded-lg border-gray-200 font-mono text-xs"
                                    />
                                </div>

                                {/* Order */}
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Sıra (Order)</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={form.order}
                                        onChange={(e) => updateField("order", e.target.value)}
                                        placeholder="0"
                                        className="mt-2 rounded-lg border-gray-200"
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Durum</label>
                                    <select
                                        value={form.isActive ? "active" : "hidden"}
                                        onChange={(e) => updateField("isActive", e.target.value === "active")}
                                        className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-black/10"
                                    >
                                        <option value="active">Aktif</option>
                                        <option value="hidden">Gizli</option>
                                    </select>
                                </div>

                                {/* Image */}
                                <div className="md:col-span-2">
                                    <ImageUploadField
                                        label="Kategori Görseli"
                                        previewUrl={previewUrl || form.image}
                                        inputId="category-image-upload"
                                        onFileSelect={handleFileSelect}
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
                                    İptal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isUploading}
                                    className="rounded-lg bg-black text-white hover:bg-black/90 disabled:opacity-70"
                                >
                                    {isUploading
                                        ? "Kaydediliyor..."
                                        : editingCategory
                                            ? "Değişiklikleri Kaydet"
                                            : "Kategoriyi Kaydet"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
