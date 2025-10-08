"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import type { Destination } from "@/types/destination";

const formatUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatPercent = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const DEFAULT_VETERAN_BENEFIT = "No state-specific veteran benefit noted.";
const NATIONAL_GAS_AVERAGE = 3.13;
type Recommendation = "mild-winters" | "near-ocean" | "snow-adventures" | "cheap-gas";

const RECOMMENDATIONS: { id: Recommendation; label: string }[] = [
  { id: "mild-winters", label: "Somewhere with mild winters" },
  { id: "near-ocean", label: "Near the ocean" },
  { id: "snow-adventures", label: "Snow adventures" },
  { id: "cheap-gas", label: "Cheaper gas" },
];


type RetirementExplorerProps = {
  destinations: Destination[];
};

export function RetirementExplorer({ destinations }: RetirementExplorerProps) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const filtered = useMemo(() => {
    return destinations.filter((destination) => {
      if (recommendations.length > 0 && !recommendations.some(rec => matchesRecommendation(destination, rec))) {
        return false;
      }
      if (search) {
        const query = search.toLowerCase();
        const haystack = `${destination.city} ${destination.state} ${destination.veteranBenefits}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [destinations, recommendations, search]);

  const headingText =
    recommendations.includes("cheap-gas")
      ? `Showing ${filtered.length} cities where gas prices are less than the average of ${formatUsd.format(NATIONAL_GAS_AVERAGE)}.`
      : `${filtered.length} destinations`;


  const handleRecommendationClick = (id: Recommendation) => {
    setRecommendations((current) => 
      current.includes(id) 
        ? current.filter(rec => rec !== id)
        : [...current, id]
    );
  };


  if (destinations.length === 0) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center gap-6 px-4 text-center">
        <ThemeToggle />
        <h1 className="text-3xl font-semibold text-gradient">No destinations yet</h1>
        <p className="max-w-lg text-sm text-muted-foreground">
          Add destinations from the admin dashboard to see veteran benefit insights, taxes, climate data, and cost of living in this explorer.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gradient">Veteran relocation insights</h1>
          <p className="text-sm text-muted-foreground">
            Compare taxes, benefits, climate, and everyday costs across the destinations in your JSON data store.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/quiz"
            className="rounded-full border border-color-border/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition hover:text-primary"
          >
            Take the quiz
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-color-border/60 px-1 py-1 text-xs font-semibold text-muted-foreground">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`rounded-full px-3 py-1 transition ${view === "grid" ? "bg-[linear-gradient(120deg,var(--accent),var(--accent-secondary))] text-white shadow-sm" : "hover:text-primary"}`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              className={`rounded-full px-3 py-1 transition ${view === "table" ? "bg-[linear-gradient(120deg,var(--accent),var(--accent-secondary))] text-white shadow-sm" : "hover:text-primary"}`}
            >
              Table
            </button>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <section className="glass-panel space-y-5 p-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">I want to live...</p>
          <h2 className="text-2xl font-semibold text-primary">Pick the vibe that fits your next move</h2>
          <p className="text-sm text-muted-foreground">Choose a quick filter below or search for a city, state, or benefit detail.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {RECOMMENDATIONS.map((option) => {
            const isActive = recommendations.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleRecommendationClick(option.id)}
                className={`rounded-full border border-color-border/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition ${isActive ? "bg-[linear-gradient(120deg,var(--accent),var(--accent-secondary))] text-white shadow-sm" : "text-primary hover:bg-color-muted/30"}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by city, state, or benefit"
            className="flex-1 rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
          />
          {recommendation ? (
            <button
              type="button"
              onClick={() => setRecommendation(null)}
              className="rounded-full border border-color-border/60 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-color-muted/40"
            >
              Clear choice
            </button>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">{headingText}</h2>
          <p className="text-xs text-muted-foreground">Sorted by city name</p>
        </div>
        {filtered.length === 0 ? (
          <div className="glass-panel p-10 text-center text-sm text-muted-foreground">
            No destinations match the selected filters.
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((destination) => (
              <article
                key={destination.id}
                className="glass-panel grid-outline h-full space-y-3 p-5"
              >
                <header className="flex items-baseline justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      {destination.city}, {destination.state}
                    </h3>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Governor party: {formatLabel(destination.governorParty)}
                    </p>
                  </div>
                  <span className="badge-soft">
                    COL {destination.costOfLivingLabel} ({destination.costOfLiving})
                  </span>
                </header>
                <div className="flex flex-wrap gap-2 text-xs">
                  {buildFeaturePills(destination).map((pill) => (
                    <span
                      key={`${destination.id}-${pill.label}`}
                      className="inline-flex items-center gap-1 rounded-full border border-color-border/60 bg-color-muted/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary"
                    >
                      <span className="text-muted-foreground">{pill.label}</span>
                      <span>{pill.value}</span>
                    </span>
                  ))}
                </div>
                <div className="rounded-xl border border-transparent bg-[color-mix(in srgb,var(--surface-elevated) 88%, transparent)] p-4 text-sm text-primary shadow-sm">
                  <p className="font-semibold text-muted-foreground">Climate</p>
                  <p className="mt-1 leading-relaxed text-sm">{destination.climate}</p>
                </div>
                <div className="rounded-xl border border-transparent bg-[color-mix(in srgb,var(--surface-elevated) 88%, transparent)] p-4 text-sm text-primary shadow-sm">
                  <p className="font-semibold text-muted-foreground">Veteran benefits</p>
                  <p className="mt-1 leading-relaxed text-sm">{destination.veteranBenefits}</p>
                </div>
                <Link
                  href={`/${destination.stateCode.toLowerCase()}/${toCitySegment(destination.city)}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:text-accent"
                >
                  Learn more →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass-panel overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm text-primary">
              <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">City</th>
                  <th className="px-4 py-3 font-semibold">State</th>
                  <th className="px-4 py-3 font-semibold">State color</th>
                  <th className="px-4 py-3 font-semibold">Trend</th>
                  <th className="px-4 py-3 font-semibold">Sales tax</th>
                  <th className="px-4 py-3 font-semibold">Income tax</th>
                  <th className="px-4 py-3 font-semibold">COL</th>
                  <th className="px-4 py-3 font-semibold">TCI</th>
                  <th className="px-4 py-3 font-semibold">VA clinic</th>
                  <th className="px-4 py-3 font-semibold">Winter low</th>
                  <th className="px-4 py-3 font-semibold">Summer high</th>
                  <th className="px-4 py-3 font-semibold">Marijuana</th>
                  <th className="px-4 py-3 font-semibold">Firearm</th>
                  <th className="px-4 py-3 font-semibold">Snowfall</th>
                  <th className="px-4 py-3 font-semibold">Rainfall</th>
                  <th className="px-4 py-3 font-semibold">Sunny days</th>
                  <th className="px-4 py-3 font-semibold">Gas</th>
                  <th className="px-4 py-3 font-semibold">Climate</th>
                  <th className="px-4 py-3 font-semibold">Veteran benefits</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((destination) => (
                  <tr key={destination.id} className="border-t border-color-border/40 last:border-b">
                    <td className="px-4 py-3">{destination.city}</td>
                    <td className="px-4 py-3">{destination.state}</td>
                    <td className="px-4 py-3">{formatStateColor(destination.stateParty)}</td>
                    <td className="px-4 py-3">{destination.electionChange || "N/A"}</td>
                    <td className="px-4 py-3">{formatPercent.format(destination.salesTax / 100)}</td>
                    <td className="px-4 py-3">{formatPercent.format(destination.incomeTax / 100)}</td>
                    <td className="px-4 py-3">{`${destination.costOfLiving} (${destination.costOfLivingLabel})`}</td>
                    <td className="px-4 py-3">{destination.tciScore || "N/A"}</td>
                    <td className="px-4 py-3">{destination.vaSupport ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">{destination.alwScore ? `${destination.alwScore}°F` : "N/A"}</td>
                    <td className="px-4 py-3">{destination.ahsScore ? `${destination.ahsScore}°F` : "N/A"}</td>
                    <td className="px-4 py-3">{formatLabel(destination.marijuanaStatus)}</td>
                    <td className="px-4 py-3">{formatLabel(destination.firearmLaws)}</td>
                    <td className="px-4 py-3">{`${destination.snowfall}" / yr`}</td>
                    <td className="px-4 py-3">{`${destination.rainfall}" / yr`}</td>
                    <td className="px-4 py-3">{destination.sunnyDays}</td>
                    <td className="px-4 py-3">{formatUsd.format(destination.gasPrice)}</td>
                    <td className="px-4 py-3">{formatClimateSummary(destination.climate)}</td>
                    <td className="px-4 py-3">{hasCustomVeteranBenefit(destination.veteranBenefits) ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

type FeaturePill = {
  label: string;
  value: string;
};

function buildFeaturePills(destination: Destination): FeaturePill[] {
  const pills: FeaturePill[] = [
    { label: "Sales", value: formatPercent.format(destination.salesTax / 100) },
    { label: "Income", value: formatPercent.format(destination.incomeTax / 100) },
    { label: "COL", value: `${destination.costOfLiving} (${destination.costOfLivingLabel})` },
    { label: "Climate", value: formatClimateSummary(destination.climate) },
    { label: "Snow", value: destination.snowfall ? `${destination.snowfall}"/yr` : "N/A" },
    { label: "Sun", value: `${destination.sunnyDays} days` },
    { label: "Gas", value: `${formatUsd.format(destination.gasPrice)} (${destination.gasPrice <= NATIONAL_GAS_AVERAGE ? "Cheaper" : "Expensive"})` },
    { label: "Rain", value: destination.rainfall ? `${destination.rainfall}"/yr` : "N/A" },
    { label: "Marijuana", value: formatLabel(destination.marijuanaStatus) },
    { label: "Firearm", value: formatLabel(destination.firearmLaws) },
  ];

  pills.push({ label: "VA clinic", value: destination.vaSupport ? "Yes" : "No" });
  pills.push({ label: "Tech hub", value: destination.techHub ? "Yes" : "No" });
  pills.push({ label: "LGBTQ+", value: destination.lgbtqScore ? destination.lgbtqScore.toString() : "N/A" });

  if (destination.tciScore) {
    pills.push({ label: "Crime index", value: destination.tciScore.toString() });
  }

  return pills.slice(0, 10);
}

function formatLabel(value: string) {
  return value
    .split(/[\s-]+/)
    .map((fragment) => fragment.charAt(0).toUpperCase() + fragment.slice(1))
    .join(" ");
}

function formatClimateSummary(climate: string) {
  const summary = climate.split(' with ')[0]?.trim();
  return summary || climate;
}

function hasCustomVeteranBenefit(benefit: string) {
  const trimmed = benefit.trim();
  return trimmed.length > 0 && trimmed !== DEFAULT_VETERAN_BENEFIT;
}


function toCitySegment(city: string) {
  return city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatStateColor(party: string) {
  const normalized = party.toLowerCase();
  if (normalized === "republican") {
    return "Red";
  }
  if (normalized === "democrat") {
    return "Blue";
  }
  return formatLabel(party);
}

function matchesRecommendation(destination: Destination, recommendation: Recommendation) {
  switch (recommendation) {
    case "mild-winters":
      return destination.alwScore ? destination.alwScore >= 30 : false;
    case "near-ocean": {
      const climate = destination.climate.toLowerCase();
      return /coast|coastal|humid subtropical|mediterranean|marine|ocean/.test(climate);
    }
    case "snow-adventures":
      return destination.snowfall >= 25 || /cold|alpine|snow/.test(destination.climate.toLowerCase());
    case "cheap-gas":
      return destination.gasPrice <= NATIONAL_GAS_AVERAGE;
    default:
      return true;
  }
}
