"use client";

import { useEffect, useMemo, useState } from "react";

export type WarmWinterCity = {
  id: string;
  city: string;
  state: string;
  avgWinterLow: number;
  avgSummerHigh: number;
  sunnyDays: number;
  costOfLiving: number;
  costOfLivingLabel: string;
  climate: string;
  description: string;
};

type SortOption = {
  id: "winter" | "sun";
  label: string;
  description: string;
  compare: (a: WarmWinterCity, b: WarmWinterCity) => number;
};

const SORT_OPTIONS: SortOption[] = [
  {
    id: "winter",
    label: "Warmest winter lows",
    description: "Higher average winter lows rise to the top.",
    compare: (a, b) => b.avgWinterLow - a.avgWinterLow,
  },
  {
    id: "sun",
    label: "Most sunny days",
    description: "Highlight the cities that stay brightest year-round.",
    compare: (a, b) => b.sunnyDays - a.sunnyDays,
  },
];

type WarmestWintersViewProps = {
  cities: WarmWinterCity[];
};

export function WarmestWintersView({ cities }: WarmestWintersViewProps) {
  const [sort, setSort] = useState<SortOption["id"]>("winter");
  const [selectedId, setSelectedId] = useState<string | null>(cities[0]?.id ?? null);

  useEffect(() => {
    if (cities.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !cities.some((city) => city.id === selectedId)) {
      setSelectedId(cities[0].id);
    }
  }, [cities, selectedId]);

  const selectedSort = SORT_OPTIONS.find((option) => option.id === sort) ?? SORT_OPTIONS[0];

  const sortedCities = useMemo(() => {
    return [...cities].sort(selectedSort.compare);
  }, [cities, selectedSort]);

  const selectedCity =
    sortedCities.find((city) => city.id === selectedId) ?? sortedCities[0] ?? null;

  const maxWinterLow = useMemo(
    () => (sortedCities.length > 0 ? Math.max(...sortedCities.map((city) => city.avgWinterLow)) : 0),
    [sortedCities]
  );

  const maxSunnyDays = useMemo(
    () => (sortedCities.length > 0 ? Math.max(...sortedCities.map((city) => city.sunnyDays)) : 0),
    [sortedCities]
  );

  if (cities.length === 0) {
    return (
      <div className="rounded-xl border border-color-border/60 bg-card/40 p-8 text-center">
        <h2 className="text-xl font-semibold text-primary">No data available</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t find destination data to build the warm winter list.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section className="space-y-5">
        <header className="flex flex-col gap-3 rounded-xl border border-color-border/50 bg-card/40 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Sort the list
            </p>
            <h2 className="text-2xl font-semibold text-gradient">Explore the mildest winters</h2>
            <p className="text-sm text-muted-foreground">{selectedSort.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map((option) => {
              const isActive = option.id === selectedSort.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSort(option.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    isActive
                      ? "border-transparent bg-[linear-gradient(120deg,var(--accent),var(--accent-secondary))] text-white shadow-sm"
                      : "border-color-border/60 text-primary hover:bg-color-muted/30"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </header>

        <ul className="grid gap-4">
          {sortedCities.map((city, index) => {
            const isActive = city.id === selectedCity?.id;
            const winterProgress = maxWinterLow ? Math.round((city.avgWinterLow / maxWinterLow) * 100) : 0;
            const sunProgress = maxSunnyDays ? Math.round((city.sunnyDays / maxSunnyDays) * 100) : 0;
            return (
              <li key={city.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(city.id)}
                  className={`group w-full rounded-xl border p-5 text-left transition ${
                    isActive
                      ? "border-transparent bg-[linear-gradient(120deg,var(--accent),var(--accent-secondary))] text-white shadow-lg shadow-accent/20"
                      : "border-color-border/50 bg-card/40 hover:-translate-y-0.5 hover:border-color-border/80 hover:bg-card/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">
                        #{index + 1}
                      </p>
                      <h3 className="mt-1 text-xl font-semibold">
                        {city.city}, {city.state}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                        isActive ? "bg-white/15" : "bg-color-muted/20 text-muted-foreground"
                      }`}
                    >
                      COL {Math.round(city.costOfLiving)}
                    </span>
                  </div>

                  <p className={`mt-2 text-sm ${isActive ? "text-white/90" : "text-muted-foreground"}`}>
                    {city.climate}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <StatisticBar
                      label="Avg Winter Low (°F)"
                      value={city.avgWinterLow.toFixed(0)}
                      progress={winterProgress}
                      accent={isActive}
                    />
                    <StatisticBar
                      label="Sunny Days / Year"
                      value={city.sunnyDays.toString()}
                      progress={sunProgress}
                      accent={isActive}
                    />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="space-y-4 rounded-xl border border-color-border/50 bg-card/40 p-6">
        {!selectedCity ? (
          <div>
            <h2 className="text-xl font-semibold text-primary">Select a city</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a destination from the list to see its full breakdown.
            </p>
          </div>
        ) : (
          <>
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Detail view
              </p>
              <h2 className="text-3xl font-semibold text-gradient leading-tight">
                {selectedCity.city}, {selectedCity.state}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedCity.description || selectedCity.climate}
              </p>
            </header>

            <div className="rounded-lg border border-color-border/40 bg-surface/60 p-5 space-y-4">
              <DataPoint
                label="Average winter low"
                value={`${selectedCity.avgWinterLow.toFixed(1)}°F`}
                helper="Measured as the average low temperature during winter months."
              />
              <DataPoint
                label="Average summer high"
                value={`${selectedCity.avgSummerHigh.toFixed(1)}°F`}
                helper="Useful for gauging warm-season comfort."
              />
              <DataPoint
                label="Sunny days per year"
                value={`${selectedCity.sunnyDays} days`}
              />
              <DataPoint
                label="Cost of living index"
                value={selectedCity.costOfLiving.toFixed(0)}
                helper={`Classified as ${selectedCity.costOfLivingLabel}.`}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Winter and summer figures come from the dataset&apos;s ALW/AHS scores. Higher ALW values
              reflect warmer winter lows.
            </p>
          </>
        )}
      </aside>
    </div>
  );
}

type StatisticBarProps = {
  label: string;
  value: string;
  progress: number;
  accent: boolean;
};

function StatisticBar({ label, value, progress, accent }: StatisticBarProps) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${accent ? "text-white/80" : "text-muted-foreground"}`}>
        {label}
      </p>
      <div className="mt-1 flex items-center justify-between text-sm font-semibold">
        <span className={accent ? "text-white" : "text-primary"}>{value}</span>
        <span className={`text-xs ${accent ? "text-white/70" : "text-muted-foreground"}`}>
          {progress}%
        </span>
      </div>
      <div className={`mt-2 h-2 overflow-hidden rounded-full ${accent ? "bg-white/20" : "bg-color-muted/30"}`}>
        <div
          className={`${accent ? "bg-white" : "bg-[linear-gradient(120deg,var(--accent),var(--accent-secondary))]"} h-full transition-all`}
          style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
        />
      </div>
    </div>
  );
}

type DataPointProps = {
  label: string;
  value: string;
  helper?: string;
};

function DataPoint({ label, value, helper }: DataPointProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-primary">{value}</p>
      {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  );
}
