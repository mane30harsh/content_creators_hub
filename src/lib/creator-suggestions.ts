import { prisma } from "@/lib/prisma";

export interface CreatorSuggestionItem {
  id: string;
  name: string;
  avatar?: string | null;
  type: "brand" | "community";
  slug?: string;
}

export async function getCreatorSuggestions(
  take = 5
): Promise<CreatorSuggestionItem[]> {
  const brands = await prisma.brandProfile.findMany({
    take,
    orderBy: { createdAt: "desc" },
    select: { id: true, companyName: true, logo: true, slug: true },
  });

  return brands.map((brand) => ({
    id: brand.id,
    name: brand.companyName || "Brand",
    avatar: brand.logo,
    type: "brand" as const,
    slug: brand.slug ?? undefined,
  }));
}
