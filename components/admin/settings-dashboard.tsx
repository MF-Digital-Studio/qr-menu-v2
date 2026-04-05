"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateSettingsAction, type SettingsRow } from "@/app/actions/settings-actions"
import { handleImageUpload } from "@/lib/upload-image"
import {
    buildThemeCss,
    fontFamilies,
    radiusValues,
    themePresets,
    type FontPreset,
    type RadiusPreset,
    type ThemePresetId,
} from "@/lib/themes"

export type SettingsSection = "general" | "appearance" | "perks"
type CurrencySymbol = "₺" | "$" | "€" | "£"

interface SettingsDashboardProps {
    activeTab: SettingsSection
    initialData: SettingsRow | null
}

interface GeneralProfileSettings {
    restaurantName: string
    tagline: string
    logoUrl: string
}

interface AppearanceSettings {
    splashImageUrl: string
    currencySymbol: CurrencySymbol
    campaignBannerEnabled: boolean
}

interface CustomerPerksSettings {
    wifiName: string
    wifiPassword: string
    instagramUrl: string
}

const sectionContent = {
    general: {
        title: "Genel Profil",
        description: "Restoran profilinizi ve temel menü tercihlerinizi yönetin.",
        helper: "Markanızın uygulama genelinde nasıl görüneceğini belirleyin.",
    },
    appearance: {
        title: "Görünüm",
        description: "Markanızın görsel kimliğini ve menü sunumunu yönetin.",
        helper: "Açılış ekranı ve menü deneyiminin görsel dilini ince ayarlayın.",
    },
    perks: {
        title: "Müşteri Avantajları",
        description: "Mekân içi deneyimi güçlendiren ek ayrıcalıkları yönetin.",
        helper: "Misafir deneyimini zenginleştiren faydalı bilgileri sunun.",
    },
} as const

const fontOptions = [
    { id: "modern-sans" as const, label: "Modern Sans (DM Sans)" },
    { id: "elegant-serif" as const, label: "Zarif Serif (Crimson Pro)" },
]

const radiusOptions = [
    { id: "square" as const, label: "Kare" },
    { id: "rounded" as const, label: "Yuvarlak" },
    { id: "extra-round" as const, label: "Ekstra Yuvarlak" },
]

export function SettingsDashboard({ activeTab, initialData }: SettingsDashboardProps) {
    const defaultSplashUrl =
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80"

    const router = useRouter()
    const logoInputRef = useRef<HTMLInputElement | null>(null)
    const splashInputRef = useRef<HTMLInputElement | null>(null)

    const [generalProfile, setGeneralProfile] = useState<GeneralProfileSettings>({
        restaurantName: initialData?.restaurantName ?? "",
        tagline: initialData?.slogan ?? "",
        logoUrl: initialData?.logo ?? "",
    })
    const [appearance, setAppearance] = useState<AppearanceSettings>({
        splashImageUrl: initialData?.splashImage ?? defaultSplashUrl,
        currencySymbol: (initialData?.currencySymbol as CurrencySymbol) ?? "₺",
        campaignBannerEnabled: true,
    })
    const [customerPerks, setCustomerPerks] = useState<CustomerPerksSettings>({
        wifiName: initialData?.wifiSSID ?? "",
        wifiPassword: initialData?.wifiPassword ?? "",
        instagramUrl: initialData?.instagramUrl ?? "",
    })
    const [logoPreview, setLogoPreview] = useState(initialData?.logo ?? "")
    const [splashPreview, setSplashPreview] = useState(initialData?.splashImage ?? defaultSplashUrl)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [splashFile, setSplashFile] = useState<File | null>(null)
    const [selectedTheme, setSelectedTheme] = useState<ThemePresetId>(
        (initialData?.theme as ThemePresetId) ?? "minimalist"
    )
    const [selectedFont, setSelectedFont] = useState<FontPreset>(
        (initialData?.fontFamily as FontPreset) ?? "modern-sans"
    )
    const [selectedRadius, setSelectedRadius] = useState<RadiusPreset>(
        (initialData?.borderRadius as RadiusPreset) ?? "rounded"
    )
    const [isPending, startTransition] = useTransition()

    const currentTheme = themePresets.find((theme) => theme.id === selectedTheme) ?? themePresets[0]

    // Live-preview CSS vars in the admin while editing
    useEffect(() => {
        if (typeof window === "undefined") return
        const previewCss = buildThemeCss(selectedTheme, selectedRadius, selectedFont)
        const styleId = "settings-live-preview"
        let styleElement = document.getElementById(styleId) as HTMLStyleElement | null

        if (!styleElement) {
            styleElement = document.createElement("style")
            styleElement.id = styleId
            document.head.appendChild(styleElement)
        }

        styleElement.textContent = previewCss

        return () => {
            styleElement?.remove()
        }
    }, [selectedFont, selectedRadius, selectedTheme])

    const handleSaveGeneral = () => {
        startTransition(async () => {
            try {
                let logoUrl = generalProfile.logoUrl
                if (logoFile) {
                    logoUrl = await handleImageUpload(logoFile)
                    setGeneralProfile((prev) => ({ ...prev, logoUrl }))
                    setLogoPreview(logoUrl)
                    setLogoFile(null)
                }
                await updateSettingsAction({
                    restaurantName: generalProfile.restaurantName,
                    slogan: generalProfile.tagline || null,
                    logo: logoUrl || null,
                })
                router.refresh()
                toast.success("Genel profil kaydedildi")
            } catch {
                toast.error("Kayıt sırasında bir hata oluştu")
            }
        })
    }

    const handleSaveAppearance = () => {
        startTransition(async () => {
            try {
                let splashImageUrl = appearance.splashImageUrl
                if (splashFile) {
                    splashImageUrl = await handleImageUpload(splashFile)
                    setAppearance((prev) => ({ ...prev, splashImageUrl }))
                    setSplashPreview(splashImageUrl)
                    setSplashFile(null)
                }
                await updateSettingsAction({
                    theme: selectedTheme,
                    fontFamily: selectedFont,
                    borderRadius: selectedRadius,
                    currencySymbol: appearance.currencySymbol,
                    splashImage: splashImageUrl || null,
                })
                router.refresh()
                toast.success("Görünüm ayarları kaydedildi")
            } catch {
                toast.error("Kayıt sırasında bir hata oluştu")
            }
        })
    }

    const handleSavePerks = () => {
        startTransition(async () => {
            try {
                await updateSettingsAction({
                    wifiSSID: customerPerks.wifiName || null,
                    wifiPassword: customerPerks.wifiPassword || null,
                    instagramUrl: customerPerks.instagramUrl || null,
                })
                router.refresh()
                toast.success("Müşteri avantajları kaydedildi")
            } catch {
                toast.error("Kayıt sırasında bir hata oluştu")
            }
        })
    }

    const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const previewUrl = URL.createObjectURL(file)
        setLogoFile(file)
        setLogoPreview(previewUrl)
        setGeneralProfile((prev) => ({ ...prev, logoUrl: previewUrl }))
    }

    const handleSplashFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const previewUrl = URL.createObjectURL(file)
        setSplashFile(file)
        setSplashPreview(previewUrl)
        setAppearance((prev) => ({ ...prev, splashImageUrl: previewUrl }))
    }

    const currentSection = sectionContent[activeTab]

    return (
        <section className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 pl-16 backdrop-blur-sm lg:pl-6">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Yönetim / Ayarlar</p>
                    <h1 className="text-xl font-bold tracking-tight">Ayarlar</h1>
                </div>
            </header>

            <main className="flex-1 p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto max-w-6xl"
                >
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            {currentSection.title}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">{currentSection.description}</p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                        {activeTab === "general" && (
                            <div className="space-y-6">


                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="relative h-20 w-20 overflow-hidden rounded-full border border-border bg-muted">
                                        <Image
                                            src={logoPreview}
                                            alt="Restoran logosu"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoFileChange}
                                    />
                                    <div className="space-y-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-fit rounded-xl"
                                            onClick={() => logoInputRef.current?.click()}
                                        >
                                            Logo Yükle
                                        </Button>
                                        {logoFile && (
                                            <p className="text-xs text-muted-foreground">Seçilen: {logoFile.name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground">Restoran Adı</label>
                                        <Input
                                            value={generalProfile.restaurantName}
                                            onChange={(event) =>
                                                setGeneralProfile((prev) => ({ ...prev, restaurantName: event.target.value }))
                                            }
                                            className="mt-2 rounded-xl border-border bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-foreground">Slogan / Açıklama</label>
                                        <textarea
                                            value={generalProfile.tagline}
                                            onChange={(event) =>
                                                setGeneralProfile((prev) => ({ ...prev, tagline: event.target.value }))
                                            }
                                            rows={4}
                                            className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        disabled={isPending}
                                        onClick={handleSaveGeneral}
                                        className="rounded-xl bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isPending ? "Kaydediliyor..." : "Kaydet"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === "appearance" && (
                            <div className="space-y-6">


                                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-sm font-medium text-foreground">Açılış Ekranı Görseli</label>
                                            <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-muted">
                                                <div className="relative h-44 w-full">
                                                    <Image
                                                        src={splashPreview}
                                                        alt="Açılış görseli önizlemesi"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </div>
                                            <input
                                                ref={splashInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleSplashFileChange}
                                            />
                                            <div className="mt-3 space-y-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="rounded-xl"
                                                    onClick={() => splashInputRef.current?.click()}
                                                >
                                                    Görsel Yükle
                                                </Button>
                                                {splashFile && (
                                                    <p className="text-xs text-muted-foreground">Seçilen: {splashFile.name}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-border bg-muted/60 p-4">
                                            <div className="mb-4">
                                                <h4 className="text-sm font-semibold text-foreground">Tema Seçici</h4>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Menü deneyiminiz için rafine bir marka teması seçin.
                                                </p>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {themePresets.map((theme) => {
                                                    const isSelected = selectedTheme === theme.id

                                                    return (
                                                        <motion.button
                                                            key={theme.id}
                                                            type="button"
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => setSelectedTheme(theme.id)}
                                                            className={`rounded-2xl border p-3 text-left transition ${isSelected
                                                                ? "border-primary ring-2 ring-ring/20"
                                                                : "border-border hover:border-ring/40"
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-semibold text-foreground">
                                                                    {theme.name}
                                                                </span>
                                                                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${isSelected
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "bg-muted text-transparent"
                                                                    }`}>
                                                                    <Check className="h-3.5 w-3.5" />
                                                                </span>
                                                            </div>

                                                            <div
                                                                className="mt-3 rounded-xl border p-3"
                                                                style={{ backgroundColor: theme.background }}
                                                            >
                                                                <div className="mb-3 flex gap-2">
                                                                    <span
                                                                        className="h-4 w-4 rounded-full"
                                                                        style={{ backgroundColor: theme.primary }}
                                                                    />
                                                                    <span
                                                                        className="h-4 w-4 rounded-full"
                                                                        style={{ backgroundColor: theme.surface }}
                                                                    />
                                                                    <span
                                                                        className="h-4 w-4 rounded-full"
                                                                        style={{ backgroundColor: theme.accent }}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="h-2 w-20 rounded-full bg-black/10" />
                                                                    <div
                                                                        className="h-8 w-24 rounded-lg"
                                                                        style={{ backgroundColor: theme.primary }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </motion.button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="text-sm font-medium text-foreground">Yazı Tipi</label>
                                                <select
                                                    value={selectedFont}
                                                    onChange={(event) => setSelectedFont(event.target.value as FontPreset)}
                                                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                                                >
                                                    {fontOptions.map((font) => (
                                                        <option key={font.id} value={font.id}>
                                                            {font.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-foreground">Para Birimi Simgesi</label>
                                                <select
                                                    value={appearance.currencySymbol}
                                                    onChange={(event) =>
                                                        setAppearance((prev) => ({
                                                            ...prev,
                                                            currencySymbol: event.target.value as CurrencySymbol,
                                                        }))
                                                    }
                                                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                                                >
                                                    <option value="₺">₺</option>
                                                    <option value="$">$</option>
                                                    <option value="€">€</option>
                                                    <option value="£">£</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-foreground">Köşe Yuvarlaklığı</label>
                                            <div className="mt-2 inline-flex rounded-xl border border-border bg-background p-1">
                                                {radiusOptions.map((option) => (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        onClick={() => setSelectedRadius(option.id)}
                                                        className={`rounded-lg px-3 py-2 text-sm transition ${selectedRadius === option.id
                                                            ? "bg-primary text-primary-foreground"
                                                            : "text-muted-foreground hover:text-foreground"
                                                            }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-foreground">Kampanya Afişi</label>
                                            <div className="mt-2 flex items-center justify-between rounded-xl border border-border px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">
                                                        Menüde Öne Çıkan Kampanya Afişini Etkinleştir
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Müşteri menüsünde öne çıkan kampanyaları vurgulayın.
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setAppearance((prev) => ({
                                                            ...prev,
                                                            campaignBannerEnabled: !prev.campaignBannerEnabled,
                                                        }))
                                                    }
                                                    className={`relative h-7 w-12 rounded-full transition ${appearance.campaignBannerEnabled ? "bg-primary" : "bg-muted"
                                                        }`}
                                                    aria-pressed={appearance.campaignBannerEnabled}
                                                >
                                                    <span
                                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${appearance.campaignBannerEnabled ? "left-6" : "left-1"
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-border bg-muted/60 p-4 shadow-sm">
                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-foreground">Mini Önizleme</h4>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Marka güncellemelerinizi anında görün.
                                            </p>
                                        </div>

                                        <motion.div
                                            key={`${selectedTheme}-${selectedFont}-${selectedRadius}`}
                                            initial={{ opacity: 0.8, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden border p-3 shadow-sm"
                                            style={{
                                                backgroundColor: currentTheme.background,
                                                borderColor: currentTheme.accent,
                                                borderRadius: radiusValues[selectedRadius],
                                                fontFamily: fontFamilies[selectedFont],
                                            }}
                                        >
                                            <div
                                                className="relative mb-3 h-24 w-full overflow-hidden"
                                                style={{ borderRadius: radiusValues[selectedRadius] }}
                                            >
                                                <Image
                                                    src={splashPreview}
                                                    alt="Tema önizlemesi"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                                                <div className="absolute bottom-2 left-2 text-xs font-semibold text-white">
                                                    Öne Çıkan İçecek
                                                </div>
                                            </div>

                                            <div
                                                className="space-y-2 border p-3"
                                                style={{
                                                    backgroundColor: currentTheme.surface,
                                                    borderColor: currentTheme.accent,
                                                    borderRadius: radiusValues[selectedRadius],
                                                }}
                                            >
                                                <p
                                                    className="text-[10px] uppercase tracking-[0.2em]"
                                                    style={{ color: currentTheme.muted }}
                                                >
                                                    Günün Seçimi
                                                </p>
                                                <h5 className="text-sm font-semibold" style={{ color: currentTheme.text }}>
                                                    İmza Latte
                                                </h5>
                                                <p className="text-xs" style={{ color: currentTheme.muted }}>
                                                    Yumuşak, modern ve özenle servis edilir.
                                                </p>
                                                <button
                                                    type="button"
                                                    className="mt-2 w-full px-3 py-2 text-sm font-medium"
                                                    style={{
                                                        backgroundColor: currentTheme.primary,
                                                        color: currentTheme.buttonText,
                                                        borderRadius: radiusValues[selectedRadius],
                                                        fontFamily: fontFamilies[selectedFont],
                                                    }}
                                                >
                                                    Siparişe Ekle
                                                </button>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        disabled={isPending}
                                        onClick={handleSaveAppearance}
                                        className="rounded-xl bg-black px-4 py-2 text-white hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isPending ? "Kaydediliyor..." : "Kaydet"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === "perks" && (
                            <div className="space-y-6">


                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground">Wi‑Fi Ağ Adı (SSID)</label>
                                        <Input
                                            value={customerPerks.wifiName}
                                            onChange={(event) =>
                                                setCustomerPerks((prev) => ({ ...prev, wifiName: event.target.value }))
                                            }
                                            className="mt-2 rounded-xl border-border bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-foreground">Wi‑Fi Şifresi</label>
                                        <Input
                                            value={customerPerks.wifiPassword}
                                            onChange={(event) =>
                                                setCustomerPerks((prev) => ({ ...prev, wifiPassword: event.target.value }))
                                            }
                                            className="mt-2 rounded-xl border-border bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-foreground">Instagram Profil Bağlantısı</label>
                                        <div className="mt-2 flex overflow-hidden rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-ring">
                                            <span className="flex items-center bg-muted px-3 text-sm text-muted-foreground">
                                                https://
                                            </span>
                                            <input
                                                value={customerPerks.instagramUrl}
                                                onChange={(event) =>
                                                    setCustomerPerks((prev) => ({ ...prev, instagramUrl: event.target.value }))
                                                }
                                                className="w-full px-3 py-2 text-sm text-foreground outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button
                                            type="button"
                                            disabled={isPending}
                                            onClick={handleSavePerks}
                                            className="rounded-xl bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {isPending ? "Kaydediliyor..." : "Kaydet"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </section>
    )
}
