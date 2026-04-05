"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export type SettingsRow = {
    restaurantName: string
    slogan: string | null
    logo: string | null
    theme: string
    fontFamily: string
    currencySymbol: string
    borderRadius: string
    wifiSSID: string | null
    wifiPassword: string | null
    instagramUrl: string | null
    splashImage: string | null
}

export async function getSettings(): Promise<SettingsRow> {
    const row = await prisma.settings.findUnique({ where: { id: "singleton" } })
    return {
        restaurantName: row?.restaurantName ?? "",
        slogan: row?.slogan ?? null,
        logo: row?.logo ?? null,
        theme: row?.theme ?? "minimalist",
        fontFamily: row?.fontFamily ?? "modern-sans",
        currencySymbol: row?.currencySymbol ?? "₺",
        borderRadius: row?.borderRadius ?? "rounded",
        wifiSSID: row?.wifiSSID ?? null,
        wifiPassword: row?.wifiPassword ?? null,
        instagramUrl: row?.instagramUrl ?? null,
        splashImage: row?.splashImage ?? null,
    }
}

export async function updateSettingsAction(data: Partial<SettingsRow>): Promise<void> {
    await prisma.settings.upsert({
        where: { id: "singleton" },
        create: { id: "singleton", ...data },
        update: data,
    })

    revalidatePath("/", "layout")
    revalidatePath("/menu")
    revalidatePath("/admin/settings")
    revalidatePath("/admin/settings/appearance")
    revalidatePath("/admin/settings/customer-perks")
}
