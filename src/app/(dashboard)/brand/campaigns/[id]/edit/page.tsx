import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { getBrandCampaignDetail } from "@/lib/actions/campaign";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { fromCents } from "@/lib/validations/campaign";

export const metadata = { title: "Edit Campaign – Content Creators Hub" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCampaignPage({ params }: Props) {
  const { id } = await params;
  await requireRole(["BRAND", "ADMIN"]);
  const campaign = await getBrandCampaignDetail(id);
  if (!campaign) notFound();

  if (campaign.status === "COMPLETED" || campaign.status === "CANCELLED") {
    notFound();
  }

  const defaultValues = {
    title:            campaign.title,
    description:      campaign.description,
    deliverableType:  campaign.deliverableType,
    deliverableCount: campaign.deliverableCount,
    deliverableNotes: campaign.deliverableNotes ?? "",
    budgetMin:        fromCents(campaign.budgetMinCents),
    budgetMax:        fromCents(campaign.budgetMaxCents),
    currency:         campaign.currency,
    niche:            campaign.niche,
    country:          campaign.country,
    language:         campaign.language,
    minFollowers:     campaign.minFollowers ?? undefined,
    maxFollowers:     campaign.maxFollowers ?? undefined,
    applicationDeadline: campaign.applicationDeadline
      ? new Date(campaign.applicationDeadline).toISOString().split("T")[0]
      : "",
    campaignStartDate: campaign.campaignStartDate
      ? new Date(campaign.campaignStartDate).toISOString().split("T")[0]
      : "",
    campaignEndDate: campaign.campaignEndDate
      ? new Date(campaign.campaignEndDate).toISOString().split("T")[0]
      : "",
    maxAccepted:     campaign.maxAccepted,
    maxApplications: campaign.maxApplications ?? undefined,
    isPublic:        campaign.isPublic,
    tags:            campaign.tags,
    coverImage:      campaign.coverImage ?? "",
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href={`/brand/campaigns/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to campaign
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit campaign</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your campaign details. Changes apply immediately.
        </p>
      </div>

      <CampaignForm mode="edit" campaignId={id} defaultValues={defaultValues} />
    </main>
  );
}
