import { RetirementExplorer } from "@/components/retirement-explorer";
import { loadDestinations } from "@/lib/destination-store";

export default async function Home() {
  const destinations = await loadDestinations();

  return <RetirementExplorer destinations={destinations} />;
}
