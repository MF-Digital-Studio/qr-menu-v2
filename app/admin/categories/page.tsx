import { CategoriesDashboard } from "@/components/admin/categories-dashboard"
import { getCategories } from "@/app/actions/category-actions"

export default async function CategoriesPage() {
    const categories = await getCategories()
    return <CategoriesDashboard categories={categories} />
}
