"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function getCampaignData() {
    const campaign = await prisma.campaign.findUnique({
        where: { id: "singleton" },
    })
    return campaign
}

export interface UpdateCampaignInput {
    bannerImage?: string | null
    bannerTitle?: string | null
    bannerDescription?: string | null
    isBannerActive: boolean
    popupImage?: string | null
    popupTitle?: string | null
    popupMessage?: string | null
    isPopupActive: boolean
}

export async function updateCampaignAction(
    data: UpdateCampaignInput,
): Promise<{ error?: string }> {
    try {
        await prisma.campaign.upsert({
            where: { id: "singleton" },
            create: { id: "singleton", ...data },
            update: data,
        })

        revalidatePath("/admin/campaigns")
        revalidatePath("/menu")

        return {}
    } catch (err) {
        console.error("[updateCampaignAction]", err)
        return { error: "Kampanya kaydedilemedi." }
    }
}
