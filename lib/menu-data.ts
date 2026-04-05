import { prisma } from "@/lib/prisma"

export interface MenuProduct {
    id: string
    name: string
    description: string
    price: number
    image: string
    isSoldOut: boolean
}

export interface MenuCategory {
    id: string
    name: string
    slug: string
    image: string
    products: MenuProduct[]
}

export interface MenuSettings {
    restaurantName: string
    slogan: string | null
    logo: string | null
    currencySymbol: string
    bannerImage: string | null
    bannerTitle: string | null
    bannerDescription: string | null
    isPopupActive: boolean
    popupImage: string | null
    popupTitle: string | null
    popupMessage: string | null
}

export async function getMenuData(): Promise<{
    settings: MenuSettings
    categories: MenuCategory[]
}> {
    const [settingsRow, campaignRow, categories] = await Promise.all([
        prisma.settings.findUnique({ where: { id: "singleton" } }),
        prisma.campaign.findUnique({
            where: { id: "singleton" },
            select: {
                isBannerActive: true,
                bannerImage: true,
                bannerTitle: true,
                bannerDescription: true,
                isPopupActive: true,
                popupImage: true,
                popupTitle: true,
                popupMessage: true,
            },
        }),
        prisma.category.findMany({
            where: { isActive: true },
            orderBy: { order: "asc" },
            include: {
                products: {
                    where: { isActive: true },
                    orderBy: { order: "asc" },
                },
            },
        }),
    ])

    const isBannerActive = campaignRow?.isBannerActive ?? false

    const settings: MenuSettings = {
        restaurantName: settingsRow?.restaurantName || "Menü",
        slogan: settingsRow?.slogan ?? null,
        logo: settingsRow?.logo ?? null,
        currencySymbol: settingsRow?.currencySymbol ?? "₺",
        bannerImage: isBannerActive ? (campaignRow?.bannerImage ?? null) : null,
        bannerTitle: isBannerActive ? (campaignRow?.bannerTitle ?? null) : null,
        bannerDescription: isBannerActive ? (campaignRow?.bannerDescription ?? null) : null,
        isPopupActive: campaignRow?.isPopupActive ?? false,
        popupImage: campaignRow?.popupImage ?? null,
        popupTitle: campaignRow?.popupTitle ?? null,
        popupMessage: campaignRow?.popupMessage ?? null,
    }

    const menuCategories: MenuCategory[] = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image ?? "",
        products: cat.products.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description ?? "",
            price: Number(p.price),
            image: p.image ?? "",
            isSoldOut: p.isSoldOut,
        })),
    }))

    return { settings, categories: menuCategories }
}
