import { SettingsDashboard } from "@/components/admin/settings-dashboard"
import { getSettings } from "@/app/actions/settings-actions"

export default async function SettingsAppearancePage() {
    const initialData = await getSettings()
    return <SettingsDashboard activeTab="appearance" initialData={initialData} />
}
