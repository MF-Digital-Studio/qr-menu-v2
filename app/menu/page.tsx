import { CustomerMenu } from "@/components/customer-menu"
import { getMenuData } from "@/lib/menu-data"

export const revalidate = 0

export default async function MenuPage() {
    const { settings, categories } = await getMenuData()
    return <CustomerMenu settings={settings} categories={categories} />
}
