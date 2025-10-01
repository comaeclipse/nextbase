import { RetirementExplorer } from "@/components/retirement-explorer";
import { destinations as fallbackDestinations } from "@/data/destinations";
import { prisma } from "@/lib/prisma";
import type { Destination } from "@/types/destination";

export default async function Home() {
  const destinationsFromDb = await prisma.destination.findMany({
    orderBy: { name: "asc" },
  });

  const destinations: Destination[] = destinationsFromDb.map((destination) => ({
    id: destination.id,
    name: destination.name,
    state: destination.state,
    region: destination.region as Destination["region"],
    climate: destination.climate as Destination["climate"],
    taxBand: destination.taxBand as Destination["taxBand"],
    costOfLivingIndex: destination.costOfLivingIndex,
    lifestyle: destination.lifestyle as Destination["lifestyle"],
    techPresence: destination.techPresence as Destination["techPresence"],
    gunLaws: destination.gunLaws as Destination["gunLaws"],
    vaResourcesScore: destination.vaResourcesScore,
    healthcareIndex: destination.healthcareIndex,
    summary: destination.summary,
    highlights: destination.highlights as Destination["highlights"],
    heroImage: destination.heroImage,
  }));

  return (
    <RetirementExplorer destinations={destinations.length ? destinations : fallbackDestinations} />
  );
}
