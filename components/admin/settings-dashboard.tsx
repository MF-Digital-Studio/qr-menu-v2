"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { useToast } from "@/context/toast-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type SettingsSection = "general" | "appearance" | "perks"
type CurrencySymbol = "₺" | "$" | "€" | "£"
type ThemePresetId = "minimalist" | "royal-gold" | "nature" | "midnight"
type FontPreset = "modern-sans" | "elegant-serif" | "classic-mono"
type RadiusPreset = "square" | "rounded" | "extra-round"

interface SettingsDashboardProps {
    activeTab: SettingsSection
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

const themePresets = [
    {
        id: "minimalist" as const,
        name: "Minimal",
        primary: "#0f172a",
        background: "#ffffff",
        surface: "#f8fafc",
        accent: "#e2e8f0",
        text: "#0f172a",
        muted: "#64748b",
        buttonText: "#ffffff",
    },
    {
        id: "royal-gold" as const,
        name: "Kraliyet Altını",
        primary: "#c8a75b",
        background: "#1c1917",
        surface: "#f8f1df",
        accent: "#4a3c1c",
        text: "#f8f1df",
        muted: "#d6c6a1",
        buttonText: "#1c1917",
    },
    {
        id: "nature" as const,
        name: "Doğa",
        primary: "#4f7a5c",
        background: "#f7f7f2",
        surface: "#ffffff",
        accent: "#c6d3c1",
        text: "#243129",
        muted: "#6b7280",
        buttonText: "#ffffff",
    },
    {
        id: "midnight" as const,
        name: "Gece",
        primary: "#5b7cfa",
        background: "#0f172a",
        surface: "#dbe4ff",
        accent: "#27344d",
        text: "#e2e8f0",
        muted: "#94a3b8",
        buttonText: "#ffffff",
    },
]

const fontOptions = [
    { id: "modern-sans" as const, label: "Modern Sans (Geist Sans)" },
    { id: "elegant-serif" as const, label: "Zarif Serif (Playfair Display)" },
    { id: "classic-mono" as const, label: "Klasik Mono" },
]

const radiusOptions = [
    { id: "square" as const, label: "Kare" },
    { id: "rounded" as const, label: "Yuvarlak" },
    { id: "extra-round" as const, label: "Ekstra Yuvarlak" },
]

const fontFamilies: Record<FontPreset, string> = {
    "modern-sans": "var(--font-geist-sans), 'Geist Sans', sans-serif",
    "elegant-serif": "'Playfair Display', Georgia, serif",
    "classic-mono": "'SFMono-Regular', 'Roboto Mono', monospace",
}

const radiusValues: Record<RadiusPreset, string> = {
    square: "0.4rem",
    rounded: "0.75rem",
    "extra-round": "1.25rem",
}

export function SettingsDashboard({ activeTab }: SettingsDashboardProps) {
    const defaultLogoUrl =
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=200&q=80"
    const defaultSplashUrl =
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80"

    const logoInputRef = useRef<HTMLInputElement | null>(null)
    const splashInputRef = useRef<HTMLInputElement | null>(null)

    const [generalProfile, setGeneralProfile] = useState<GeneralProfileSettings>({
        restaurantName: "MF Digital Cafe",
        tagline: "Mahallenizin modern kahvesi, özenle servis edilir.",
        logoUrl: defaultLogoUrl,
    })
    const [appearance, setAppearance] = useState<AppearanceSettings>({
        splashImageUrl: defaultSplashUrl,
        currencySymbol: "₺",
        campaignBannerEnabled: true,
    })
    const [customerPerks, setCustomerPerks] = useState<CustomerPerksSettings>({
        wifiName: "MF-Digital-Guest",
        wifiPassword: "cafe2026",
        instagramUrl: "instagram.com/mfdigitalcafe",
    })
    const [logoPreview, setLogoPreview] = useState(defaultLogoUrl)
    const [splashPreview, setSplashPreview] = useState(defaultSplashUrl)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [splashFile, setSplashFile] = useState<File | null>(null)
    const { addToast } = useToast()
    const [selectedTheme, setSelectedTheme] = useState<ThemePresetId>("minimalist")
    const [selectedFont, setSelectedFont] = useState<FontPreset>("modern-sans")
    const [selectedRadius, setSelectedRadius] = useState<RadiusPreset>("rounded")
    const [isSaving, setIsSaving] = useState(false)

    const currentTheme = themePresets.find((theme) => theme.id === selectedTheme) ?? themePresets[0]

    useEffect(() => {
        if (typeof window === "undefined") return

        const savedThemeSettings = window.localStorage.getItem("mf-digital-theme-settings")
        if (!savedThemeSettings) return

        try {
            const parsed = JSON.parse(savedThemeSettings) as {
                theme?: ThemePresetId
                font?: FontPreset
                radius?: RadiusPreset
            }

            if (parsed.theme && themePresets.some((theme) => theme.id === parsed.theme)) {
                setSelectedTheme(parsed.theme)
            }

            if (parsed.font && fontOptions.some((font) => font.id === parsed.font)) {
                setSelectedFont(parsed.font)
            }

            if (parsed.radius && radiusOptions.some((radius) => radius.id === parsed.radius)) {
                setSelectedRadius(parsed.radius)
            }
        } catch (error) {
            console.error("Failed to load theme settings", error)
        }
    }, [])

    useEffect(() => {
        if (typeof window === "undefined") return

        window.localStorage.setItem(
            "mf-digital-theme-settings",
            JSON.stringify({
                theme: selectedTheme,
                font: selectedFont,
                radius: selectedRadius,
            }),
        )

        document.documentElement.style.setProperty("--primary", currentTheme.primary)
        document.documentElement.style.setProperty("--radius", radiusValues[selectedRadius])
        document.documentElement.style.setProperty("--font-family", fontFamilies[selectedFont])
    }, [currentTheme.primary, selectedFont, selectedRadius, selectedTheme])

    const handleSaveAction = (_message: string) => {
        setIsSaving(true)

        window.setTimeout(() => {
            setIsSaving(false)
            addToast("Ayarlar kaydedildi", "success")
        }, 250)
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
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            {currentSection.title}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">{currentSection.description}</p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        {activeTab === "general" && (
                            <div className="space-y-6">


                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="relative h-20 w-20 overflow-hidden rounded-full border border-gray-200 bg-slate-100">
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
                                            <p className="text-xs text-slate-500">Seçilen: {logoFile.name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Restoran Adı</label>
                                        <Input
                                            value={generalProfile.restaurantName}
                                            onChange={(event) =>
                                                setGeneralProfile((prev) => ({ ...prev, restaurantName: event.target.value }))
                                            }
                                            className="mt-2 rounded-xl border-gray-200 focus-visible:ring-2 focus-visible:ring-black"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Slogan / Açıklama</label>
                                        <textarea
                                            value={generalProfile.tagline}
                                            onChange={(event) =>
                                                setGeneralProfile((prev) => ({ ...prev, tagline: event.target.value }))
                                            }
                                            rows={4}
                                            className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-black"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        disabled={isSaving}
                                        onClick={() => handleSaveAction("Genel profil kaydedildi")}
                                        className="rounded-xl bg-black px-4 py-2 text-white hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isSaving ? "Kaydediliyor..." : "Kaydet"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === "appearance" && (
                            <div className="space-y-6">


                                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-sm font-medium text-slate-700">Açılış Ekranı Görseli</label>
                                            <div className="mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-slate-100">
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
                                                    <p className="text-xs text-slate-500">Seçilen: {splashFile.name}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-gray-100 bg-slate-50/80 p-4">
                                            <div className="mb-4">
                                                <h4 className="text-sm font-semibold text-slate-900">Tema Seçici</h4>
                                                <p className="mt-1 text-xs text-slate-500">
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
                                                                ? "border-black ring-2 ring-black/10"
                                                                : "border-gray-200 hover:border-slate-300"
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-semibold text-slate-900">
                                                                    {theme.name}
                                                                </span>
                                                                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${isSelected
                                                                    ? "bg-black text-white"
                                                                    : "bg-slate-100 text-transparent"
                                                                    }`}>
                                                                    <Check className="h-3.5 w-3.5" />
                                                                </span>
                                                            </div>

                                                            <div
                                                                className="mt-3 rounded-xl border border-black/5 p-3"
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
                                                <label className="text-sm font-medium text-slate-700">Yazı Tipi</label>
                                                <select
                                                    value={selectedFont}
                                                    onChange={(event) => setSelectedFont(event.target.value as FontPreset)}
                                                    className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-black"
                                                >
                                                    {fontOptions.map((font) => (
                                                        <option key={font.id} value={font.id}>
                                                            {font.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-slate-700">Para Birimi Simgesi</label>
                                                <select
                                                    value={appearance.currencySymbol}
                                                    onChange={(event) =>
                                                        setAppearance((prev) => ({
                                                            ...prev,
                                                            currencySymbol: event.target.value as CurrencySymbol,
                                                        }))
                                                    }
                                                    className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-black"
                                                >
                                                    <option value="₺">₺</option>
                                                    <option value="$">$</option>
                                                    <option value="€">€</option>
                                                    <option value="£">£</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-slate-700">Köşe Yuvarlaklığı</label>
                                            <div className="mt-2 inline-flex rounded-xl border border-gray-200 bg-white p-1">
                                                {radiusOptions.map((option) => (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        onClick={() => setSelectedRadius(option.id)}
                                                        className={`rounded-lg px-3 py-2 text-sm transition ${selectedRadius === option.id
                                                            ? "bg-black text-white"
                                                            : "text-slate-600 hover:text-slate-900"
                                                            }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-slate-700">Kampanya Afişi</label>
                                            <div className="mt-2 flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">
                                                        Menüde Öne Çıkan Kampanya Afişini Etkinleştir
                                                    </p>
                                                    <p className="text-xs text-slate-500">
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
                                                    className={`relative h-7 w-12 rounded-full transition ${appearance.campaignBannerEnabled ? "bg-black" : "bg-slate-300"
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

                                    <div className="rounded-2xl border border-gray-100 bg-slate-50 p-4 shadow-sm">
                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-slate-900">Mini Önizleme</h4>
                                            <p className="mt-1 text-xs text-slate-500">
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
                                        disabled={isSaving}
                                        onClick={() => handleSaveAction("Görünüm ayarları kaydedildi")}
                                        className="rounded-xl bg-black px-4 py-2 text-white hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isSaving ? "Kaydediliyor..." : "Kaydet"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === "perks" && (
                            <div className="space-y-6">


                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Wi‑Fi Ağ Adı (SSID)</label>
                                        <Input
                                            value={customerPerks.wifiName}
                                            onChange={(event) =>
                                                setCustomerPerks((prev) => ({ ...prev, wifiName: event.target.value }))
                                            }
                                            className="mt-2 rounded-xl border-gray-200 focus-visible:ring-2 focus-visible:ring-black"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Wi‑Fi Şifresi</label>
                                        <Input
                                            value={customerPerks.wifiPassword}
                                            onChange={(event) =>
                                                setCustomerPerks((prev) => ({ ...prev, wifiPassword: event.target.value }))
                                            }
                                            className="mt-2 rounded-xl border-gray-200 focus-visible:ring-2 focus-visible:ring-black"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Instagram Profil Bağlantısı</label>
                                        <div className="mt-2 flex overflow-hidden rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-black">
                                            <span className="flex items-center bg-slate-50 px-3 text-sm text-slate-500">
                                                https://
                                            </span>
                                            <input
                                                value={customerPerks.instagramUrl}
                                                onChange={(event) =>
                                                    setCustomerPerks((prev) => ({ ...prev, instagramUrl: event.target.value }))
                                                }
                                                className="w-full px-3 py-2 text-sm text-slate-900 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button
                                            type="button"
                                            disabled={isSaving}
                                            onClick={() => handleSaveAction("Müşteri avantajları kaydedildi")}
                                            className="rounded-xl bg-black px-4 py-2 text-white hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {isSaving ? "Kaydediliyor..." : "Kaydet"}
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
