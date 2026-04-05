import { SettingsDashboard } from "@/components/admin/settings-dashboard"
import { getSettings } from "@/app/actions/settings-actions"

export default async function SettingsPage() {
    const initialData = await getSettings()
    return <SettingsDashboard activeTab="general" initialData={initialData} />
}
