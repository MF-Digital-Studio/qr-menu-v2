import { getCampaignData } from "@/app/actions/campaign-actions"
import { CampaignsDashboard } from "@/components/admin/campaigns-dashboard"

export default async function CampaignsPage() {
    const campaign = await getCampaignData()
    return <CampaignsDashboard initialData={campaign} />
}
