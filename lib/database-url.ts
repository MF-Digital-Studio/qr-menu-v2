const SSLMODE_ALIASES = new Set(["prefer", "require", "verify-ca"])

export function normalizeDatabaseUrl(databaseUrl: string): string {
    try {
        const url = new URL(databaseUrl)
        const sslMode = url.searchParams.get("sslmode")
        const usesLibpqCompat = url.searchParams.get("uselibpqcompat") === "true"

        if (sslMode && SSLMODE_ALIASES.has(sslMode) && !usesLibpqCompat) {
            url.searchParams.set("sslmode", "verify-full")
        }

        return url.toString()
    } catch {
        return databaseUrl
    }
}