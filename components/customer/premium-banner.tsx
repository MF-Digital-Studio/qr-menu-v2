"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface PremiumBannerProps {
    imageUrl?: string | null
}

export function PremiumBanner({ imageUrl }: PremiumBannerProps) {
    if (!imageUrl) {
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, y: -2 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="group mx-4 mb-3 overflow-hidden rounded-2xl border border-zinc-200 p-0 shadow-lg transition-shadow hover:shadow-xl dark:border-zinc-800"
        >
            <div className="relative h-56 w-full overflow-hidden rounded-2xl sm:h-64 md:h-72 lg:h-80">
                <Image
                    src={imageUrl}
                    alt="Premium campaign banner"
                    fill
                    priority={true}
                    sizes="100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ objectFit: "cover" }}
                />

                <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/25 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/80 sm:text-xs">
                        Weekend Signature
                    </p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                        Specialty Coffee Ritual
                    </h2>
                    <p className="mt-1 max-w-xs text-xs text-white/85 sm:text-sm">
                        A premium seasonal highlight designed as a polished campaign surface.
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
