import { SplashScreen } from "@/components/splash-screen"
import { getSettings } from "@/app/actions/settings-actions"

export default async function Home() {
  const settings = await getSettings()
  return (
    <SplashScreen
      restaurantName={settings.restaurantName || "Menü"}
      slogan={settings.slogan}
      logoUrl={settings.logo}
      wifiSSID={settings.wifiSSID}
      wifiPassword={settings.wifiPassword}
      instagramUrl={settings.instagramUrl}
    />
  )
}
