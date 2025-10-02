"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { FIREARM_OPTIONS, MARIJUANA_OPTIONS, PARTY_OPTIONS } from "@/data/destination-options";
import type { Destination, FirearmLaw, GovernorParty, MarijuanaStatus } from "@/types/destination";

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

type RetirementExplorerProps = {
  destinations: Destination[];
};

export function RetirementExplorer({ destinations }: RetirementExplorerProps) {
  const maxCostAvailable = useMemo(() => {
    if (!destinations.length) {
      return 0;
    }
    return Math.max(...destinations.map((destination) => destination.costOfLiving));
  }, [destinations]);

  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [party, setParty] = useState<GovernorParty | "">("");
  const [marijuana, setMarijuana] = useState<MarijuanaStatus | "">("");
  const [firearm, setFirearm] = useState<FirearmLaw | "">("");
  const [maxCost, setMaxCost] = useState(() => (maxCostAvailable ? Math.ceil(maxCostAvailable) : 200));

  useEffect(() => {
    if (maxCostAvailable) {
      setMaxCost(Math.ceil(maxCostAvailable));
    }
  }, [maxCostAvailable]);

  const filtered = useMemo(() => {
    return destinations.filter((destination) => {
      if (party && destination.governorParty !== party) {
        return false;
      }
      if (marijuana && destination.marijuanaStatus !== marijuana) {
        return false;
      }
      if (firearm && destination.firearmLaws !== firearm) {
        return false;
      }
      if (Number.isFinite(maxCost) && destination.costOfLiving > maxCost) {
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
  }, [destinations, party, marijuana, firearm, maxCost, search]);

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

      <section className="glass-panel grid grid-cols-1 gap-4 p-6 md:grid-cols-4">
        <FilterBlock label="Search">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by city, state, or benefit"
            className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
          />
        </FilterBlock>
        <FilterBlock label="Governor party">
          <select
            value={party}
            onChange={(event) => setParty(event.target.value as GovernorParty | "")}
            className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
          >
            <option value="">Any</option>
            {PARTY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterBlock>
        <FilterBlock label="Marijuana status">
          <select
            value={marijuana}
            onChange={(event) => setMarijuana(event.target.value as MarijuanaStatus | "")}
            className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
          >
            <option value="">Any</option>
            {MARIJUANA_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterBlock>
        <FilterBlock label="Firearm laws">
          <select
            value={firearm}
            onChange={(event) => setFirearm(event.target.value as FirearmLaw | "")}
            className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
          >
            <option value="">Any</option>
            {FIREARM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterBlock>
        <FilterBlock className="md:col-span-2" label={`Cost of living <= ${maxCost}`}>
          <input
            type="range"
            min="0"
            max={Math.max(10, Math.ceil(maxCostAvailable || 200))}
            value={maxCost}
            onChange={(event) => setMaxCost(Number(event.target.value))}
            className="w-full accent-accent"
          />
        </FilterBlock>
        <div className="md:col-span-2 flex items-end justify-end">
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setParty("");
              setMarijuana("");
              setFirearm("");
              setMaxCost(maxCostAvailable ? Math.ceil(maxCostAvailable) : 200);
            }}
            className="rounded-full border border-transparent bg-[linear-gradient(120deg,var(--accent),var(--accent-secondary))] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Reset filters
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">{filtered.length} destinations</h2>
          <p className="text-xs text-muted-foreground">Sorted by city name</p>
        </div>
        {filtered.length === 0 ? (
          <div className="glass-panel p-10 text-center text-sm text-muted-foreground">
            No destinations match the selected filters.
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((destination) => (
              <article
                key={destination.id}
                className="glass-panel grid-outline h-full space-y-4 p-6"
              >
                <header className="flex items-baseline justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-primary">
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
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <Stat label="Sales tax" value={formatPercent.format(destination.salesTax / 100)} />
                  <Stat label="Income tax" value={formatPercent.format(destination.incomeTax / 100)} />
                  <Stat label="Marijuana" value={formatLabel(destination.marijuanaStatus)} />
                  <Stat label="Firearm laws" value={formatLabel(destination.firearmLaws)} />
                  <Stat label="Gifford grade" value={destination.giffordScore} />
                  <Stat label="Cost of living" value={`${destination.costOfLiving} (${destination.costOfLivingLabel})`} />
                  <Stat label="Snowfall" value={`${destination.snowfall}" / yr`} />
                  <Stat label="Rainfall" value={`${destination.rainfall}" / yr`} />
                  <Stat label="Sunny days" value={`${destination.sunnyDays} days`} />
                  <Stat label="Gas price" value={formatUsd.format(destination.gasPrice)} />
                </dl>
                <div className="rounded-xl border border-transparent bg-[color-mix(in srgb,var(--surface-elevated) 88%, transparent)] p-4 text-sm text-primary shadow-sm">
                  <p className="font-semibold text-muted-foreground">Climate</p>
                  <p className="mt-1 leading-relaxed text-sm">{destination.climate}</p>
                </div>
                <div className="rounded-xl border border-transparent bg-[color-mix(in srgb,var(--surface-elevated) 88%, transparent)] p-4 text-sm text-primary shadow-sm">
                  <p className="font-semibold text-muted-foreground">Veteran benefits</p>
                  <p className="mt-1 leading-relaxed text-sm">{destination.veteranBenefits}</p>
                </div>
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
                  <th className="px-4 py-3 font-semibold">Party</th>
                  <th className="px-4 py-3 font-semibold">Sales tax</th>
                  <th className="px-4 py-3 font-semibold">Income tax</th>
                  <th className="px-4 py-3 font-semibold">Marijuana</th>
                  <th className="px-4 py-3 font-semibold">Firearm</th>
                  <th className="px-4 py-3 font-semibold">Gifford</th>
                  <th className="px-4 py-3 font-semibold">COL</th>
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
                    <td className="px-4 py-3">{formatLabel(destination.governorParty)}</td>
                    <td className="px-4 py-3">{formatPercent.format(destination.salesTax / 100)}</td>
                    <td className="px-4 py-3">{formatPercent.format(destination.incomeTax / 100)}</td>
                    <td className="px-4 py-3">{formatLabel(destination.marijuanaStatus)}</td>
                    <td className="px-4 py-3">{formatLabel(destination.firearmLaws)}</td>
                    <td className="px-4 py-3">{destination.giffordScore}</td>
                    <td className="px-4 py-3">{`${destination.costOfLiving} (${destination.costOfLivingLabel})`}</td>
                    <td className="px-4 py-3">{`${destination.snowfall}" / yr`}</td>
                    <td className="px-4 py-3">{`${destination.rainfall}" / yr`}</td>
                    <td className="px-4 py-3">{destination.sunnyDays}</td>
                    <td className="px-4 py-3">{formatUsd.format(destination.gasPrice)}</td>
                    <td className="px-4 py-3">{destination.climate}</td>
                    <td className="px-4 py-3">{destination.veteranBenefits}</td>
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

type FilterBlockProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

function FilterBlock({ label, children, className }: FilterBlockProps) {
  return (
    <div className={`card-accent space-y-3 p-4 text-sm text-primary ${className ?? ""}`}>
      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

type StatProps = {
  label: string;
  value: string;
};

function Stat({ label, value }: StatProps) {
  return (
    <div className="card-accent px-4 py-4 text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-primary">{value}</p>
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .split(/[\s-]+/)
    .map((fragment) => fragment.charAt(0).toUpperCase() + fragment.slice(1))
    .join(" ");
}
