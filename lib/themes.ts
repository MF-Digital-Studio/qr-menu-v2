export type ThemePresetId = "minimalist" | "royal-gold" | "nature" | "midnight"
export type FontPreset = "modern-sans" | "elegant-serif"
export type RadiusPreset = "square" | "rounded" | "extra-round"

export interface ThemePreset {
    id: ThemePresetId
    name: string
    primary: string
    background: string
    surface: string
    accent: string
    text: string
    muted: string
    buttonText: string
}

export const themePresets: ThemePreset[] = [
    {
        id: "minimalist",
        name: "Minimal",
        primary: "#000000",
        background: "#ffffff",
        surface: "#f8f9fa",
        accent: "#dee2e6",
        text: "#000000",
        muted: "#6c757d",
        buttonText: "#ffffff",
    },
    {
        id: "royal-gold",
        name: "Kraliyet Altını",
        primary: "#c5a059",
        background: "#14110f",
        surface: "#1d1815",
        accent: "#4b3a1e",
        text: "#f7f2e8",
        muted: "#c8b79a",
        buttonText: "#111111",
    },
    {
        id: "nature",
        name: "Doğa",
        primary: "#4a6741",
        background: "#f2f4f2",
        surface: "#ffffff",
        accent: "#c6d3c1",
        text: "#1b261b",
        muted: "#6b7c6b",
        buttonText: "#ffffff",
    },
    {
        id: "midnight",
        name: "Gece",
        primary: "#3b82f6",
        background: "#0a0a0a",
        surface: "#171717",
        accent: "#262626",
        text: "#ffffff",
        muted: "#a3a3a3",
        buttonText: "#ffffff",
    },
]

export const fontFamilies: Record<FontPreset, string> = {
    "modern-sans": "var(--font-dm-sans), 'DM Sans', sans-serif",
    "elegant-serif": "var(--font-crimson-pro), 'Crimson Pro', Georgia, serif",
}

export const radiusValues: Record<RadiusPreset, string> = {
    square: "0.4rem",
    rounded: "0.75rem",
    "extra-round": "1.25rem",
}

// Per-theme extras: secondary, muted bg, and sidebar vars
const themeExtras: Record<string, {
    secondary: string
    secondaryFg: string
    mutedBg: string
    sidebar: string
    sidebarFg: string
    sidebarPrimary: string
    sidebarPrimaryFg: string
    sidebarBorder: string
}> = {
    "minimalist": {
        secondary: "#f1f3f4",
        secondaryFg: "#000000",
        mutedBg: "#f8f9fa",
        sidebar: "#f8f9fa",
        sidebarFg: "#000000",
        sidebarPrimary: "#000000",
        sidebarPrimaryFg: "#ffffff",
        sidebarBorder: "#dee2e6",
    },
    "royal-gold": {
        secondary: "#221c18",
        secondaryFg: "#f7f2e8",
        mutedBg: "#181311",
        sidebar: "#161210",
        sidebarFg: "#f7f2e8",
        sidebarPrimary: "#c5a059",
        sidebarPrimaryFg: "#111111",
        sidebarBorder: "#4b3a1e",
    },
    "nature": {
        secondary: "#e8ece8",
        secondaryFg: "#1b261b",
        mutedBg: "#edf0ed",
        sidebar: "#f2f4f2",
        sidebarFg: "#1b261b",
        sidebarPrimary: "#4a6741",
        sidebarPrimaryFg: "#ffffff",
        sidebarBorder: "#c6d3c1",
    },
    "midnight": {
        secondary: "#1c1c1c",
        secondaryFg: "#ffffff",
        mutedBg: "#141414",
        sidebar: "#111111",
        sidebarFg: "#ffffff",
        sidebarPrimary: "#3b82f6",
        sidebarPrimaryFg: "#ffffff",
        sidebarBorder: "#262626",
    },
}

/** Build an inline CSS string with theme vars for a given settings row. */
export function buildThemeCss(
    themeId: string,
    borderRadius: string,
    fontFamily: string,
): string {
    const vars = getThemeVariables(themeId, borderRadius, fontFamily)

    return [
        `:root {`,
        ...Object.entries(vars).map(([key, value]) => `  ${key}: ${value};`),
        `}`,
    ].join("\n")
}

export function getThemeVariables(
    themeId: string,
    borderRadius: string,
    fontFamily: string,
): Record<string, string> {
    const preset = themePresets.find((t) => t.id === themeId) ?? themePresets[0]
    const extras = themeExtras[themeId] ?? themeExtras["minimalist"]
    const radius = radiusValues[borderRadius as RadiusPreset] ?? radiusValues.rounded
    const font = fontFamilies[fontFamily as FontPreset] ?? fontFamilies["modern-sans"]

    return {
        "--primary": preset.primary,
        "--primary-foreground": preset.buttonText,
        "--background": preset.background,
        "--foreground": preset.text,
        "--card": preset.surface,
        "--card-foreground": preset.text,
        "--popover": preset.surface,
        "--popover-foreground": preset.text,
        "--secondary": extras.secondary,
        "--secondary-foreground": extras.secondaryFg,
        "--muted": extras.mutedBg,
        "--muted-foreground": preset.muted,
        "--accent": preset.accent,
        "--accent-foreground": preset.text,
        "--border": preset.accent,
        "--input": preset.accent,
        "--ring": preset.primary,
        "--sidebar": extras.sidebar,
        "--sidebar-foreground": extras.sidebarFg,
        "--sidebar-primary": extras.sidebarPrimary,
        "--sidebar-primary-foreground": extras.sidebarPrimaryFg,
        "--sidebar-accent": extras.secondary,
        "--sidebar-accent-foreground": extras.secondaryFg,
        "--sidebar-border": extras.sidebarBorder,
        "--sidebar-ring": extras.sidebarPrimary,
        "--radius": radius,
        "--font-family": font,
    }
}
