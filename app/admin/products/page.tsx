import Link from "next/link"
import { AdminDashboard, type AdminProduct } from "@/components/admin-dashboard"
import { getActiveCategories, getProductsWithCategories } from "@/app/actions/product-actions"
import { getSettings } from "@/app/actions/settings-actions"
import { Button } from "@/components/ui/button"

export default async function ProductsPage() {
    const [rawProducts, categories, settings] = await Promise.all([
        getProductsWithCategories(),
        getActiveCategories(),
        getSettings(),
    ])

    const products: AdminProduct[] = rawProducts.map((p) => ({
        id: p.id,
        name: p.name,
        categoryId: p.categoryId,
        categoryName: p.categoryName,
        price: p.price,
        status: p.isActive ? "active" : "draft",
        image: p.image,
        description: p.description,
        isSoldOut: p.isSoldOut,
    }))

    if (categories.length === 0) {
        return (
            <section className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
                <div className="max-w-sm text-center">
                    <h2 className="text-xl font-bold tracking-tight">Önce bir kategori oluşturun</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Ürün ekleyebilmek için en az bir aktif kategori gereklidir.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/categories">Kategorilere Git</Link>
                </Button>
            </section>
        )
    }

    return <AdminDashboard products={products} categories={categories} currencySymbol={settings.currencySymbol} />
}

