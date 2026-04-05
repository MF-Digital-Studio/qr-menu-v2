"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion, Reorder, useDragControls } from "framer-motion"
import { Edit2, FolderOpen, GripVertical, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { Switch } from "@/components/ui/switch"
import { CategoryModal } from "@/components/admin/category-modal"
import {
    deleteCategoryAction,
    toggleCategoryActiveAction,
    type CategoryRow,
} from "@/app/actions/category-actions"

interface CategoryRowItemProps {
    category: CategoryRow
    isPending: boolean
    onEdit: (category: CategoryRow) => void
    onDelete: (id: string) => void
    onToggle: (id: string, isActive: boolean) => void
}

function CategoryRowItem({
    category,
    isPending,
    onEdit,
    onDelete,
    onToggle,
}: CategoryRowItemProps) {
    const dragControls = useDragControls()

    return (
        <Reorder.Item
            value={category}
            dragListener={false}
            dragControls={dragControls}
            whileDrag={{ scale: 1.01, boxShadow: "0 16px 40px rgba(15,23,42,0.12)" }}
            className="grid grid-cols-[48px_80px_1fr_80px_120px_160px] items-center gap-4 bg-card px-4 py-3 transition-colors hover:bg-zinc-50/50"
        >
            {/* Drag handle */}
            <div>
                <button
                    type="button"
                    onPointerDown={(e) => dragControls.start(e)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-muted hover:text-gray-600"
                    aria-label={`${category.name} sırasını değiştir`}
                >
                    <GripVertical className="h-4 w-4 cursor-grab" />
                </button>
            </div>

            {/* Image */}
            <div>
                <div className="h-12 w-12 overflow-hidden rounded-xl bg-muted">
                    {category.image ? (
                        <img
                            src={category.image}
                            alt={category.name}
                            className="h-full w-full object-cover"
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <FolderOpen className="h-5 w-5 text-muted-foreground" />
                        </div>
                    )}
                </div>
            </div>

            {/* Name + slug */}
            <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{category.name}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">{category.slug}</p>
            </div>

            {/* Product count */}
            <div>
                <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-600">
                    {category.productCount} ürün
                </Badge>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-2">
                <Switch
                    checked={category.isActive}
                    onCheckedChange={(checked) => onToggle(category.id, checked)}
                    disabled={isPending}
                    aria-label={`${category.name} durum`}
                    className="cursor-pointer"
                />
                <span className={`text-xs font-medium ${category.isActive ? "text-emerald-700" : "text-muted-foreground"}`}>
                    {category.isActive ? "Aktif" : "Gizli"}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 text-sm">
                <button
                    type="button"
                    onClick={() => onEdit(category)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 text-slate-600 transition hover:text-slate-900 disabled:opacity-50"
                >
                    <Edit2 className="h-4 w-4" />
                    Düzenle
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(category.id)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 text-red-500 transition hover:text-red-600 disabled:opacity-50"
                >
                    <Trash2 className="h-4 w-4" />
                    Sil
                </button>
            </div>
        </Reorder.Item>
    )
}

interface CategoriesDashboardProps {
    categories: CategoryRow[]
}

export function CategoriesDashboard({ categories: initialCategories }: CategoriesDashboardProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Local order state for drag-to-reorder (visual only — server order saved via `order` field in modal)
    const [orderedCategories, setOrderedCategories] = useState<CategoryRow[]>(initialCategories)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)

    const categoryPendingDelete = orderedCategories.find((c) => c.id === itemToDelete) ?? null

    const handleOpenAdd = () => {
        setEditingCategory(null)
        setIsModalOpen(true)
    }

    const handleOpenEdit = (category: CategoryRow) => {
        setEditingCategory(category)
        setIsModalOpen(true)
    }

    const handleModalSuccess = () => {
        setIsModalOpen(false)
        setEditingCategory(null)
        startTransition(() => router.refresh())
    }

    const handleToggle = (id: string, isActive: boolean) => {
        // Optimistic update
        setOrderedCategories((prev) =>
            prev.map((c) => (c.id === id ? { ...c, isActive } : c)),
        )

        startTransition(async () => {
            const result = await toggleCategoryActiveAction(id, isActive)
            if (result.error) {
                toast.error(result.error)
                // Revert
                setOrderedCategories((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, isActive: !isActive } : c)),
                )
            } else {
                router.refresh()
            }
        })
    }

    const confirmDelete = () => {
        if (!itemToDelete) return
        const id = itemToDelete
        setItemToDelete(null)

        startTransition(async () => {
            const result = await deleteCategoryAction(id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Kategori silindi")
                router.refresh()
            }
        })
    }

    return (
        <section className="min-h-screen bg-background">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 pl-16 backdrop-blur-sm lg:pl-6">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Yönetim / Katalog</p>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Kategoriler</h1>
                </div>
                <Button
                    onClick={handleOpenAdd}
                    disabled={isPending}
                    className="gap-2 rounded-xl whitespace-nowrap"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Yeni Kategori Ekle</span>
                    <span className="sm:hidden">Yeni</span>
                </Button>
            </header>

            <main className="p-6">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto max-w-6xl"
                >
                    <div className="mb-4 flex justify-end">
                        <p className="text-sm text-muted-foreground">
                            Sırayı tutarak sürükleyin veya düzenleme formundaki Sıra alanını kullanın.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="overflow-x-auto">
                            <div className="min-w-160">
                                {/* Header row */}
                                <div className="grid grid-cols-[48px_80px_1fr_80px_120px_160px] items-center gap-4 border-b border-border bg-muted/40 px-4 py-3 text-sm font-medium text-muted-foreground">
                                    <div>Sıra</div>
                                    <div>Görsel</div>
                                    <div>Kategori</div>
                                    <div>Ürün</div>
                                    <div>Durum</div>
                                    <div className="text-right">İşlemler</div>
                                </div>

                                {orderedCategories.length > 0 ? (
                                    <Reorder.Group
                                        axis="y"
                                        values={orderedCategories}
                                        onReorder={setOrderedCategories}
                                        as="div"
                                        className="divide-y divide-border"
                                    >
                                        {orderedCategories.map((category) => (
                                            <CategoryRowItem
                                                key={category.id}
                                                category={category}
                                                isPending={isPending}
                                                onEdit={handleOpenEdit}
                                                onDelete={(id) => setItemToDelete(id)}
                                                onToggle={handleToggle}
                                            />
                                        ))}
                                    </Reorder.Group>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                            <FolderOpen className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="font-medium text-foreground">Henüz kategori eklenmedi</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            İlk kategorini eklemek için butona tıkla.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground">
                        Toplam{" "}
                        <span className="font-medium text-foreground">{orderedCategories.length}</span> kategori
                    </div>
                </motion.div>
            </main>

            <CategoryModal
                isOpen={isModalOpen}
                editingCategory={editingCategory}
                onClose={() => { setIsModalOpen(false); setEditingCategory(null) }}
                onSuccess={handleModalSuccess}
            />

            <ConfirmModal
                isOpen={Boolean(itemToDelete)}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Kategori silinsin mi?"
                description={
                    categoryPendingDelete
                        ? `${categoryPendingDelete.name} katalogtan kalıcı olarak kaldırılacak. Bu kategorideki ${categoryPendingDelete.productCount} ürün de silinecektir.`
                        : "Bu işlem geri alınamaz."
                }
            />
        </section>
    )
}
