import { SettingsDashboard } from "@/components/admin/settings-dashboard"
import { getSettings } from "@/app/actions/settings-actions"

export default async function SettingsCustomerPerksPage() {
    const initialData = await getSettings()
    return <SettingsDashboard activeTab="perks" initialData={initialData} />
}
