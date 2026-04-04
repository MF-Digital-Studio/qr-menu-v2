"use client"

import { motion } from "framer-motion"
import { Smartphone, MonitorSmartphone, LayoutDashboard } from "lucide-react"

type ViewType = "splash" | "menu" | "admin"

interface ViewToggleProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
}

const views = [
  { id: "splash" as ViewType, name: "Splash Screen", icon: Smartphone },
  { id: "menu" as ViewType, name: "Customer Menu", icon: MonitorSmartphone },
  { id: "admin" as ViewType, name: "Admin Dashboard", icon: LayoutDashboard },
]

export function ViewToggle({ activeView, onViewChange }: ViewToggleProps) {
  return (
    <div className="fixed left-1/2 top-4 z-[100] -translate-x-1/2">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1 rounded-full border border-border bg-card/95 p-1 shadow-lg backdrop-blur-md"
      >
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeView === view.id
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeView === view.id && (
              <motion.div
                layoutId="activeView"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">
              <view.icon className="h-4 w-4" />
            </span>
            <span className="relative z-10 hidden sm:inline">{view.name}</span>
          </button>
        ))}
      </motion.div>
    </div>
  )
}
