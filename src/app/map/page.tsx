import type { MapMarker } from "@/components/destination-map";
import { MapOverview } from "@/components/map-overview";
import { CITY_COORDINATES } from "@/data/city-coordinates";
import { loadDestinations } from "@/lib/destination-store";

export const revalidate = 3600;

export default async function MapPage() {
  const destinations = await loadDestinations();

  const markers = destinations
    .map((destination) => {
      const coordinates = CITY_COORDINATES[destination.id];
      if (!coordinates) {
        return null;
      }
      return {
        id: destination.id,
        city: destination.city,
        state: destination.state,
        stateCode: destination.stateCode,
        lat: coordinates.lat,
        lon: coordinates.lon,
        population: destination.population,
        giffordScore: destination.giffordScore,
      } satisfies MapMarker;
    })
    .filter((entry): entry is MapMarker => Boolean(entry));

  const missingDestinations = destinations
    .filter((destination) => !CITY_COORDINATES[destination.id])
    .map((destination) => ({
      id: destination.id,
      city: destination.city,
      stateCode: destination.stateCode,
    }));

  return (
    <MapOverview
      markers={markers}
      totalDestinations={destinations.length}
      missingDestinations={missingDestinations}
    />
  );
}
