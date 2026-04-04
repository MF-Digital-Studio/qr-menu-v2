"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Menu, MessageSquare, Ticket, Globe, Instagram, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SplashScreenProps {
  onNavigate?: (view: "menu" | "feedback" | "campaigns") => void
}

export function SplashScreen({ onNavigate }: SplashScreenProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/cafe-interior.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-between px-6 py-12">
        {/* Center Brand Focus */}
        <div className="flex flex-1 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center justify-center space-y-4 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-white/20 shadow-2xl backdrop-blur-sm"
            >
              <Image
                src="/images/cafe-interior.jpg"
                alt="MF Digital Cafe logo"
                fill
                className="object-cover"
                priority
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl font-extrabold tracking-tight text-white drop-shadow-xl"
            >
              MF Digital Cafe
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-xs text-lg font-medium text-gray-200 drop-shadow-md"
            >
              Mahallenizin modern kahvesi, özenle servis edilir.
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom Panel - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-3xl p-6 shadow-2xl">
            <div className="mb-4 flex w-full items-center justify-between rounded-xl border border-white/10 bg-secondary/80 p-3 text-white backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm font-medium text-secondary-foreground">
                <Wifi className="h-4 w-4" />
                <span>Ağ:</span>
                <span>MF-Digital-Guest</span>
              </div>
              <span className="rounded-md bg-black/30 px-2 py-1 font-mono text-xs">Şifre: cafe2026</span>
            </div>

            {/* Primary Action */}
            <Button
              asChild
              className="mb-4 h-14 w-full gap-3 rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              <Link href="/menu">
                <Menu className="h-5 w-5" />
                Menüye Git
              </Link>
            </Button>

            {/* Secondary Actions */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <Button
                onClick={() => onNavigate?.("feedback")}
                variant="secondary"
                className="h-12 gap-2 rounded-xl bg-secondary/80 font-medium text-secondary-foreground transition-all hover:bg-secondary active:scale-[0.98]"
              >
                <MessageSquare className="h-4 w-4" />
                Geri Bildirim Ver
              </Button>
              <Button
                onClick={() => onNavigate?.("campaigns")}
                variant="secondary"
                className="relative h-12 gap-2 rounded-xl bg-secondary/80 font-medium text-secondary-foreground transition-all hover:bg-secondary active:scale-[0.98]"
              >
                <Ticket className="h-4 w-4" />
                Kampanyalar
                {/* Notification Badge */}
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                  1
                </span>
              </Button>
            </div>

            {/* Footer Area */}
            <div className="flex items-center justify-between border-t border-border/50 pt-4">
              {/* Language Selector */}
              <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                <Globe className="h-4 w-4" />
                <span>🇹🇷</span>
                <span>Türkçe</span>
              </button>

              {/* Social Icons */}
              <div className="flex items-center gap-2">
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  aria-label="Web sitesi"
                >
                  <Globe className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Brand Signature */}
            <p className="mt-4 text-center text-xs text-muted-foreground/70">
              <span className="font-medium">MF Digital Studio</span> tarafından tutkuyla hazırlandı
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
