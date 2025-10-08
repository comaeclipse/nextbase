"use client";

import Link from "next/link";

import { DestinationMap, type MapMarker } from "@/components/destination-map";
import { ThemeToggle } from "@/components/theme-toggle";

type MapOverviewProps = {
  markers: MapMarker[];
  totalDestinations: number;
  missingDestinations: { id: string; city: string; stateCode: string }[];
};

export function MapOverview({ markers, totalDestinations, missingDestinations }: MapOverviewProps) {
  const plottedCount = markers.length;

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Map overview</p>
          <h1 className="text-3xl font-semibold text-gradient">See every destination at a glance</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Explore how your shortlisted cities line up geographically. Hover each marker to view quick details, then hop
            back into the explorer to dive deeper.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-color-border/60 px-4 py-2 text-sm font-semibold transition hover:text-primary"
          >
            Back to explorer
          </Link>
          <ThemeToggle size="sm" />
        </div>
      </header>

      <DestinationMap markers={markers} />

      <section className="glass-panel space-y-4 p-6">
        <h2 className="text-2xl font-semibold text-primary">Destination rollup</h2>
        <p className="text-sm text-muted-foreground">
          {totalDestinations > 0
            ? `Plotting ${plottedCount} of ${totalDestinations} destinations from your JSON store.`
            : "Add destinations to your data store to populate the map."}
        </p>
        {plottedCount > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {markers.map((marker) => {
              const populationLabel = Number.isFinite(marker.population) && marker.population > 0
                ? marker.population.toLocaleString()
                : "N/A";
              return (
                <div
                  key={marker.id}
                  className="rounded-xl border border-color-border/50 bg-color-surface/40 px-4 py-3 text-sm shadow-sm"
                >
                  <p className="font-semibold text-primary">
                    {marker.city}, {marker.stateCode}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Population {populationLabel} &middot; Giffords {marker.giffordScore || "N/A"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}
        {missingDestinations.length > 0 ? (
          <div className="rounded-xl border border-dashed border-color-border/60 bg-color-surface/30 px-4 py-3 text-xs text-muted-foreground">
            Missing coordinate data for {missingDestinations.length} destination
            {missingDestinations.length === 1 ? "" : "s"}. Update src/data/city-coordinates.ts to add a latitude/longitude
            pair for:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {missingDestinations.map((destination) => (
                <li key={destination.id}>
                  {destination.city}, {destination.stateCode}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </main>
  );
}
