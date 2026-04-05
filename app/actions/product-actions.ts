"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export interface ProductWithCategory {
    id: string
    name: string
    description: string
    price: number
    image: string
    isSoldOut: boolean
    isActive: boolean
    order: number
    categoryId: string
    categoryName: string
}

export interface CategoryOption {
    id: string
    name: string
}

export async function getProductsWithCategories(): Promise<ProductWithCategory[]> {
    const products = await prisma.product.findMany({
        include: { category: { select: { name: true } } },
        orderBy: { order: "asc" },
    })

    return products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description ?? "",
        price: Number(p.price),
        image: p.image ?? "",
        isSoldOut: p.isSoldOut,
        isActive: p.isActive,
        order: p.order,
        categoryId: p.categoryId,
        categoryName: p.category.name,
    }))
}

export async function getActiveCategories(): Promise<CategoryOption[]> {
    return prisma.category.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: { id: true, name: true },
    })
}

export interface UpsertProductData {
    id?: string
    name: string
    description: string
    price: number
    image: string
    categoryId: string
    isActive: boolean
    isSoldOut: boolean
}

export async function upsertProductAction(
    data: UpsertProductData,
): Promise<{ error?: string }> {
    try {
        const payload = {
            name: data.name,
            description: data.description,
            price: data.price,
            image: data.image || null,
            categoryId: data.categoryId,
            isActive: data.isActive,
            isSoldOut: data.isSoldOut,
        }

        if (data.id) {
            await prisma.product.update({ where: { id: data.id }, data: payload })
        } else {
            await prisma.product.create({ data: payload })
        }

        revalidatePath("/admin/products")
        return {}
    } catch (error) {
        console.error("upsertProductAction error:", error)
        return { error: "Ürün kaydedilemedi. Lütfen tekrar deneyin." }
    }
}

export async function deleteProductAction(id: string): Promise<{ error?: string }> {
    try {
        await prisma.product.delete({ where: { id } })
        revalidatePath("/admin/products")
        return {}
    } catch (error) {
        console.error("deleteProductAction error:", error)
        return { error: "Ürün silinemedi. Lütfen tekrar deneyin." }
    }
}

export async function toggleSoldOutAction(
    id: string,
    isSoldOut: boolean,
): Promise<{ error?: string }> {
    try {
        await prisma.product.update({ where: { id }, data: { isSoldOut } })
        revalidatePath("/admin/products")
        return {}
    } catch (error) {
        console.error("toggleSoldOutAction error:", error)
        return { error: "Stok durumu güncellenemedi. Lütfen tekrar deneyin." }
    }
}
