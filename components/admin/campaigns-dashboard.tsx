"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Megaphone, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ImageUploadField } from "@/components/ui/image-upload-field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { handleImageUpload } from "@/lib/upload-image"
import { updateCampaignAction } from "@/app/actions/campaign-actions"

interface CampaignData {
    id: string
    bannerImage: string | null
    bannerTitle: string | null
    bannerDescription: string | null
    isBannerActive: boolean
    popupImage: string | null
    popupTitle: string | null
    popupMessage: string | null
    isPopupActive: boolean
}

interface HomeBannerState {
    title: string
    description: string
    enabled: boolean
    imageUrl: string
}

interface PopupCampaignState {
    title: string
    message: string
    enabled: boolean
    imageUrl: string
}

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"]
const defaultBannerImage =
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80"
const defaultPopupImage =
    "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80"

interface CampaignsDashboardProps {
    initialData: CampaignData | null
}

export function CampaignsDashboard({ initialData }: CampaignsDashboardProps) {
    const [isSaving, setIsSaving] = useState(false)

    const [homeBanner, setHomeBanner] = useState<HomeBannerState>({
        title: initialData?.bannerTitle ?? "Yeni Sezon Lezzetleri",
        description: initialData?.bannerDescription ?? "Taptaze tatlar ve sınırlı süreli kahve seçkileri şimdi menüde.",
        enabled: initialData?.isBannerActive ?? true,
        imageUrl: initialData?.bannerImage ?? defaultBannerImage,
    })

    const [popupCampaign, setPopupCampaign] = useState<PopupCampaignState>({
        title: initialData?.popupTitle ?? "İlk Siparişe Özel",
        message: initialData?.popupMessage ?? "Bugün sipariş veren misafirlerimize sıcak içeceklerde %10 indirim.",
        enabled: initialData?.isPopupActive ?? true,
        imageUrl: initialData?.popupImage ?? defaultPopupImage,
    })

    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [popupFile, setPopupFile] = useState<File | null>(null)
    const [bannerPreview, setBannerPreview] = useState(initialData?.bannerImage ?? defaultBannerImage)
    const [popupPreview, setPopupPreview] = useState(initialData?.popupImage ?? defaultPopupImage)

    const updatePreview = (
        setter: React.Dispatch<React.SetStateAction<string>>,
        nextUrl: string,
    ) => {
        setter((currentUrl) => {
            if (currentUrl.startsWith("blob:")) {
                URL.revokeObjectURL(currentUrl)
            }

            return nextUrl
        })
    }

    useEffect(() => {
        return () => {
            if (bannerPreview.startsWith("blob:")) {
                URL.revokeObjectURL(bannerPreview)
            }

            if (popupPreview.startsWith("blob:")) {
                URL.revokeObjectURL(popupPreview)
            }
        }
    }, [bannerPreview, popupPreview])

    const validateAndPreviewFile = (
        file: File | null,
        onValid: (previewUrl: string, selectedFile: File) => void,
    ) => {
        if (!file) {
            return
        }

        if (!allowedImageTypes.includes(file.type)) {
            toast.error("Sadece JPEG, PNG veya WEBP görseller yüklenebilir.")
            return
        }

        onValid(URL.createObjectURL(file), file)
    }

    const handleSaveCampaigns = async () => {
        setIsSaving(true)

        try {
            let nextBannerImageUrl = homeBanner.imageUrl
            let nextPopupImageUrl = popupCampaign.imageUrl

            if (bannerFile) {
                nextBannerImageUrl = await handleImageUpload(bannerFile)
            }

            if (popupFile) {
                nextPopupImageUrl = await handleImageUpload(popupFile)
            }

            const result = await updateCampaignAction({
                bannerImage: nextBannerImageUrl,
                bannerTitle: homeBanner.title,
                bannerDescription: homeBanner.description,
                isBannerActive: homeBanner.enabled,
                popupImage: nextPopupImageUrl,
                popupTitle: popupCampaign.title,
                popupMessage: popupCampaign.message,
                isPopupActive: popupCampaign.enabled,
            })

            if (result.error) {
                toast.error(result.error)
                return
            }

            setHomeBanner((prev) => ({ ...prev, imageUrl: nextBannerImageUrl }))
            setPopupCampaign((prev) => ({ ...prev, imageUrl: nextPopupImageUrl }))
            setBannerFile(null)
            setPopupFile(null)
            setBannerPreview(nextBannerImageUrl)
            setPopupPreview(nextPopupImageUrl)

            toast.success("Kampanya ayarları kaydedildi.")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Kampanya görselleri kaydedilemedi.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <section className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 pl-16 backdrop-blur-sm lg:pl-6">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Yönetim / Kampanyalar</p>
                    <h1 className="text-xl font-bold tracking-tight">Kampanyalar</h1>
                </div>

                <Button
                    onClick={handleSaveCampaigns}
                    disabled={isSaving}
                    className="rounded-xl bg-black text-white hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </Button>
            </header>

            <main className="flex-1 p-6">
                <div className="mx-auto grid max-w-6xl gap-6">
                    <motion.section
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                                    <Megaphone className="h-3.5 w-3.5" />
                                    Ana Sayfa Banner
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Banner Alanı</h2>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Menü girişinde gösterilecek duyuru kartını görsel ve metinlerle özelleştirin.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 rounded-full border border-zinc-100 bg-zinc-50 px-4 py-2">
                                <span className="text-sm font-medium text-zinc-700">Bannerı Menüde Göster</span>
                                <Switch
                                    checked={homeBanner.enabled}
                                    onCheckedChange={(checked) => setHomeBanner((prev) => ({ ...prev, enabled: checked }))}
                                    aria-label="Bannerı Menüde Göster"
                                    className="cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-4">
                                <ImageUploadField
                                    label="Banner Görseli"
                                    previewUrl={bannerPreview}
                                    inputId="campaign-banner-image"
                                    onFileSelect={(file) =>
                                        validateAndPreviewFile(file, (previewUrl, selectedFile) => {
                                            setBannerFile(selectedFile)
                                            updatePreview(setBannerPreview, previewUrl)
                                        })
                                    }
                                />

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Banner Başlığı</label>
                                    <Input
                                        value={homeBanner.title}
                                        onChange={(event) => setHomeBanner((prev) => ({ ...prev, title: event.target.value }))}
                                        placeholder="Yeni sezon kampanyası"
                                        className="mt-2 rounded-xl border-zinc-200"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Açıklama</label>
                                    <textarea
                                        value={homeBanner.description}
                                        onChange={(event) => setHomeBanner((prev) => ({ ...prev, description: event.target.value }))}
                                        placeholder="Kampanyanızın kısa açıklamasını girin"
                                        rows={4}
                                        className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:ring-2 focus:ring-black/10"
                                    />
                                </div>

                                <div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-zinc-100 bg-zinc-50 p-4">
                                <p className="mb-3 text-sm font-semibold text-zinc-800">Banner Önizlemesi</p>
                                <div className={`overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition ${homeBanner.enabled ? "opacity-100" : "opacity-60"}`}>
                                    <div className="flex gap-4 p-4">
                                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
                                            <img src={bannerPreview} alt="Banner önizlemesi" className="h-full w-full object-cover" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Kampanya</p>
                                            <h3 className="mt-1 text-base font-bold text-zinc-900">{homeBanner.title || "Banner Başlığı"}</h3>
                                            <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                                                {homeBanner.description || "Banner açıklaması burada görünecek."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Giriş Pop-up Kampanyası
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Açılış Pop-up'ı</h2>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Ziyaretçileri karşılayan bilgilendirme penceresini görsel ve metinle düzenleyin.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 rounded-full border border-zinc-100 bg-zinc-50 px-4 py-2">
                                <span className="text-sm font-medium text-zinc-700">Açılış Pop-up'ını Etkinleştir</span>
                                <Switch
                                    checked={popupCampaign.enabled}
                                    onCheckedChange={(checked) => setPopupCampaign((prev) => ({ ...prev, enabled: checked }))}
                                    aria-label="Açılış Pop-up'ını Etkinleştir"
                                    className="cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-4">
                                <ImageUploadField
                                    label="Pop-up Görseli"
                                    previewUrl={popupPreview}
                                    inputId="campaign-popup-image"
                                    onFileSelect={(file) =>
                                        validateAndPreviewFile(file, (previewUrl, selectedFile) => {
                                            setPopupFile(selectedFile)
                                            updatePreview(setPopupPreview, previewUrl)
                                        })
                                    }
                                />

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Pop-up Başlığı</label>
                                    <Input
                                        value={popupCampaign.title}
                                        onChange={(event) => setPopupCampaign((prev) => ({ ...prev, title: event.target.value }))}
                                        placeholder="Hoş geldiniz fırsatı"
                                        className="mt-2 rounded-xl border-zinc-200"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Mesaj Metni</label>
                                    <textarea
                                        value={popupCampaign.message}
                                        onChange={(event) => setPopupCampaign((prev) => ({ ...prev, message: event.target.value }))}
                                        placeholder="Kampanya mesajınızı yazın"
                                        rows={4}
                                        className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:ring-2 focus:ring-black/10"
                                    />
                                </div>

                            </div>

                            <div className="rounded-3xl border border-zinc-100 bg-zinc-50 p-4">
                                <p className="mb-3 text-sm font-semibold text-zinc-800">Pop-up Önizlemesi</p>
                                <div className="flex min-h-105 items-center justify-center rounded-[28px] bg-linear-to-b from-zinc-100 to-zinc-200 p-4">
                                    <div className={`w-full max-w-xs rounded-[26px] border border-white/70 bg-white p-3 shadow-xl transition ${popupCampaign.enabled ? "opacity-100" : "opacity-60"}`}>
                                        <div className="h-36 overflow-hidden rounded-[18px] bg-zinc-100">
                                            <img src={popupPreview} alt="Pop-up önizlemesi" className="h-full w-full object-cover" />
                                        </div>
                                        <div className="space-y-2 px-1 py-3 text-center">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Özel Kampanya</p>
                                            <h3 className="text-lg font-bold text-zinc-900">{popupCampaign.title || "Pop-up Başlığı"}</h3>
                                            <p className="text-sm leading-5 text-zinc-600">
                                                {popupCampaign.message || "Pop-up açıklaması burada görünecek."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </main>
        </section>
    )
}
