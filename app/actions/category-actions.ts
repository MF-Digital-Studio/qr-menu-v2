"use server"

import { del } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export interface CategoryRow {
    id: string
    name: string
    slug: string
    image: string
    order: number
    isActive: boolean
    productCount: number
}

export async function getCategories(): Promise<CategoryRow[]> {
    const categories = await prisma.category.findMany({
        orderBy: { order: "asc" },
        include: { _count: { select: { products: true } } },
    })

    return categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image ?? "",
        order: c.order,
        isActive: c.isActive,
        productCount: c._count.products,
    }))
}

export interface UpsertCategoryData {
    id?: string
    name: string
    slug: string
    image: string
    order: number
    isActive: boolean
}

export async function upsertCategoryAction(
    data: UpsertCategoryData,
): Promise<{ error?: string }> {
    try {
        const slug = data.slug.trim() || slugify(data.name)

        const payload = {
            name: data.name.trim(),
            slug,
            image: data.image || null,
            order: data.order,
            isActive: data.isActive,
        }

        if (data.id) {
            await prisma.category.update({ where: { id: data.id }, data: payload })
        } else {
            await prisma.category.create({ data: payload })
        }

        revalidatePath("/admin/categories")
        revalidatePath("/admin/products") // refresh category dropdown
        return {}
    } catch (error: unknown) {
        console.error("upsertCategoryAction error:", error)
        // Unique constraint on slug
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            (error as { code: string }).code === "P2002"
        ) {
            return { error: "Bu slug zaten kullanımda. Lütfen farklı bir slug girin." }
        }
        return { error: "Kategori kaydedilemedi. Lütfen tekrar deneyin." }
    }
}

export async function deleteCategoryAction(
    id: string,
): Promise<{ error?: string }> {
    try {
        const category = await prisma.category.findUnique({
            where: { id },
            select: { image: true },
        })

        await prisma.category.delete({ where: { id } })

        // Best-effort blob cleanup
        if (category?.image && category.image.includes("blob.vercel-storage.com")) {
            await del(category.image).catch(() => null)
        }

        revalidatePath("/admin/categories")
        revalidatePath("/admin/products")
        return {}
    } catch (error) {
        console.error("deleteCategoryAction error:", error)
        return { error: "Kategori silinemedi. Lütfen tekrar deneyin." }
    }
}

export async function toggleCategoryActiveAction(
    id: string,
    isActive: boolean,
): Promise<{ error?: string }> {
    try {
        await prisma.category.update({ where: { id }, data: { isActive } })
        revalidatePath("/admin/categories")
        return {}
    } catch (error) {
        console.error("toggleCategoryActiveAction error:", error)
        return { error: "Durum güncellenemedi." }
    }
}

// ── helpers ────────────────────────────────────────────────────────
function slugify(name: string): string {
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
