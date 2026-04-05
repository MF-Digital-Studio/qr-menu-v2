"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface PremiumBannerProps {
    imageUrl?: string | null
    title?: string | null
    description?: string | null
}

export function PremiumBanner({ imageUrl, title, description }: PremiumBannerProps) {
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
                    alt={title || "Kampanya banneri"}
                    fill
                    priority={true}
                    sizes="100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ objectFit: "cover" }}
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                    {title && (
                        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="mt-1 max-w-sm text-xs leading-5 text-white/85 sm:text-sm">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
