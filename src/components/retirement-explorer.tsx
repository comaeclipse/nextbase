"use client";

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { ThemeToggle } from "@/components/theme-toggle";

import type {
  ClimateProfile,
  Destination,
  GunLawProfile,
  LifestyleTag,
  Region,
  TaxBand,
  TechPresence,
} from "@/types/destination";
import type { ActiveFilter, FilterState } from "@/lib/filtering";
import {
  DEFAULT_FILTER_STATE,
  describeActiveFilters,
  filterDestinations,
} from "@/lib/filtering";

const REGION_OPTIONS: Region[] = [
  "Pacific Northwest",
  "Mountain West",
  "Southwest",
  "Southeast",
  "Midwest",
  "Northeast",
  "International",
];

const CLIMATE_OPTIONS: ClimateProfile[] = [
  "temperate",
  "warm",
  "humid",
  "coastal",
  "desert",
  "mountain",
  "cold",
];

const LIFESTYLE_OPTIONS: LifestyleTag[] = [
  "coastal living",
  "outdoor recreation",
  "urban convenience",
  "tech culture",
  "family friendly",
  "historic charm",
  "international adventure",
  "arts & culture",
];

const TAX_OPTIONS: TaxBand[] = ["very-low", "low", "moderate", "high"];
const GUN_LAW_OPTIONS: GunLawProfile[] = ["permissive", "moderate", "restrictive"];
const TECH_OPTIONS: TechPresence[] = ["established", "emerging", "limited"];

type MultiSelectKey =
  | "regions"
  | "climates"
  | "lifestyle"
  | "taxBands"
  | "techPresence"
  | "gunLaws";

type RetirementExplorerProps = {
  destinations: Destination[];
};

export function RetirementExplorer({ destinations }: RetirementExplorerProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [selectedId, setSelectedId] = useState<string>(() => destinations[0]?.id ?? "");
  const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const filteredDestinations = useMemo(
    () => filterDestinations(destinations, filters),
    [destinations, filters],
  );

  useEffect(() => {
    if (!filteredDestinations.length) {
      return;
    }
    setSelectedId((current) => {
      if (filteredDestinations.some((destination) => destination.id === current)) {
        return current;
      }
      return filteredDestinations[0].id;
    });
  }, [filteredDestinations]);

  const selectedDestination = useMemo(() => {
    return (
      filteredDestinations.find((destination) => destination.id === selectedId) ||
      destinations.find((destination) => destination.id === selectedId) ||
      filteredDestinations[0]
    );
  }, [destinations, filteredDestinations, selectedId]);

  const activeFilters = useMemo(
    () => describeActiveFilters(filters),
    [filters],
  );

  const toggleMultiSelect = <K extends MultiSelectKey>(key: K, value: FilterState[K][number]) => {
    setFilters((prev) => {
      const current = prev[key];
      const exists = current.includes(value as never);
      const next = exists
        ? (current.filter((entry) => entry !== value) as FilterState[K])
        : ([...current, value] as FilterState[K]);
      return { ...prev, [key]: next };
    });
  };

  const handleClearPill = (pill: ActiveFilter) => {
    switch (pill.category) {
      case "Region":
        toggleMultiSelect("regions", pill.value as Region);
        break;
      case "Climate":
        toggleMultiSelect("climates", pill.value as ClimateProfile);
        break;
      case "Lifestyle":
        toggleMultiSelect("lifestyle", pill.value as LifestyleTag);
        break;
      case "Tax":
        toggleMultiSelect("taxBands", pill.value as TaxBand);
        break;
      case "Tech":
        toggleMultiSelect("techPresence", pill.value as TechPresence);
        break;
      case "Gun laws":
        toggleMultiSelect("gunLaws", pill.value as GunLawProfile);
        break;
      case "Cost of living":
        setFilters((prev) => ({ ...prev, maxCostOfLiving: DEFAULT_FILTER_STATE.maxCostOfLiving }));
        break;
      case "VA resources":
        setFilters((prev) => ({ ...prev, minVaScore: DEFAULT_FILTER_STATE.minVaScore }));
        break;
      case "Search":
        setFilters((prev) => ({ ...prev, search: "" }));
        break;
      default:
        break;
    }
  };

  const clearAllFilters = () => setFilters(DEFAULT_FILTER_STATE);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <HeaderSection
        onOpenFilters={() => setFilterDrawerOpen(true)}
        totalResults={filteredDestinations.length}
      />
      <div className="relative flex flex-1 flex-col gap-6 px-4 pb-16 pt-6 sm:px-6 lg:flex-row lg:px-10">
        <aside className="glass-panel sticky top-6 hidden h-[calc(100dvh-6rem)] w-full max-w-xs flex-shrink-0 flex-col gap-8 overflow-y-auto border-0 bg-surface/70 p-6 lg:flex">
          <FilterRail
            filters={filters}
            activeFilters={activeFilters}
            onToggle={toggleMultiSelect}
            onUpdateFilters={setFilters}
            onClearPill={handleClearPill}
            onClearAll={clearAllFilters}
          />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <ActiveFilterBar
            pills={activeFilters}
            onRemove={handleClearPill}
            onClearAll={activeFilters.length ? clearAllFilters : undefined}
          />
          <ResultsGrid
            destinations={filteredDestinations}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </main>
        <aside className="glass-panel sticky top-6 hidden h-[calc(100dvh-6rem)] w-full max-w-sm flex-shrink-0 overflow-y-auto border-0 bg-surface/70 p-6 xl:flex">
          <InsightsPanel destination={selectedDestination} />
        </aside>
      </div>
      <MobileFilterSheet
        open={isFilterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        filters={filters}
        activeFilters={activeFilters}
        onToggle={toggleMultiSelect}
        onUpdateFilters={setFilters}
        onClearPill={handleClearPill}
        onClearAll={clearAllFilters}
      />
    </div>
  );
}

function HeaderSection({
  onOpenFilters,
  totalResults,
}: {
  onOpenFilters: () => void;
  totalResults: number;
}) {
  return (
    <header className="relative overflow-hidden bg-surface">
      <div className="absolute inset-x-0 top-0 hidden h-[280px] bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,_var(--accent)_22%,_transparent),_transparent_70%)] sm:block" />
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 pb-10 pt-10 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
        <div className="flex flex-1 flex-col gap-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="rounded-full bg-color-muted/40 px-3 py-1 font-medium text-muted-foreground">
              Veteran-focused
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
              {totalResults} curated destinations
            </span>
          </div>
          <div className="max-w-2xl space-y-4">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
              Find your next <span className="text-gradient">duty station for life</span>.
            </h1>
            <p className="text-pretty text-lg text-muted-foreground sm:text-xl">
              Tailor your retirement plan with data on taxes, climate, lifestyle fit, and the support networks that matter to veterans and their families.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <QuickStartChip label="Low taxes" description="Zero or low income tax states" />
            <QuickStartChip label="Coastal living" description="Waterfront communities" />
            <QuickStartChip label="Top VA access" description="High resource scores" />
          </div>
        </div>
        <div className="mt-4 flex shrink-0 items-start gap-3 lg:mt-0">
          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex items-center gap-2 rounded-full border border-color-border/60 px-4 py-2 text-sm font-medium text-primary shadow-sm transition hover:border-color-border hover:bg-color-muted/40 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
            </svg>
            Filters
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function QuickStartChip({ label, description }: { label: string; description: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-color-border/50 bg-color-muted/30 px-3 py-1 text-sm text-muted-foreground">
      <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
      <span className="font-medium text-primary">{label}</span>
      <span className="text-muted-foreground/70">{description}</span>
    </span>
  );
}

type ToggleHandler = <K extends MultiSelectKey>(key: K, value: FilterState[K][number]) => void;

type FilterRailProps = {
  filters: FilterState;
  activeFilters: ActiveFilter[];
  onToggle: ToggleHandler;
  onUpdateFilters: Dispatch<SetStateAction<FilterState>>;
  onClearPill: (pill: ActiveFilter) => void;
  onClearAll: () => void;
};

function FilterRail({
  filters,
  activeFilters,
  onToggle,
  onUpdateFilters,
  onClearPill,
  onClearAll,
}: FilterRailProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">Refine your match</h2>
          <p className="text-sm text-muted-foreground">Mix and match criteria to shape your short list.</p>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="text-sm font-medium text-accent transition hover:text-accent-secondary"
        >
          Clear all
        </button>
      </div>

      <FilterSection title="Search" description="Search by city, state, or vibe.">
        <input
          type="search"
          value={filters.search}
          onChange={(event) => onUpdateFilters((prev) => ({ ...prev, search: event.target.value }))}
          placeholder="Try Tampa, mountain, coastal..."
          className="w-full rounded-xl border border-color-border/70 bg-color-muted/30 px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/60"
        />
      </FilterSection>

      <FilterSection title="Geography" description="Choose the regions calling your name.">
        <ToggleGrid>
          {REGION_OPTIONS.map((option) => (
            <TogglePill
              key={option}
              label={option}
              active={filters.regions.includes(option)}
              onClick={() => onToggle("regions", option)}
            />
          ))}
        </ToggleGrid>
      </FilterSection>

      <FilterSection title="Climate" description="Align the weather with your ideal routine.">
        <ToggleGrid>
          {CLIMATE_OPTIONS.map((option) => (
            <TogglePill
              key={option}
              label={formatLabel(option)}
              active={filters.climates.includes(option)}
              onClick={() => onToggle("climates", option)}
            />
          ))}
        </ToggleGrid>
      </FilterSection>

      <FilterSection title="Lifestyle" description="Dial in daily rhythm and community fit.">
        <ToggleGrid>
          {LIFESTYLE_OPTIONS.map((option) => (
            <TogglePill
              key={option}
              label={formatLabel(option)}
              active={filters.lifestyle.includes(option)}
              onClick={() => onToggle("lifestyle", option)}
            />
          ))}
        </ToggleGrid>
      </FilterSection>

      <FilterSection title="Taxes & policy" description="Understand the financial landscape.">
        <div className="space-y-4">
          <Subheading>Tax friendliness</Subheading>
          <ToggleGrid>
            {TAX_OPTIONS.map((option) => (
              <TogglePill
                key={option}
                label={formatLabel(option)}
                active={filters.taxBands.includes(option)}
                onClick={() => onToggle("taxBands", option)}
              />
            ))}
          </ToggleGrid>
          <Subheading>Gun laws</Subheading>
          <ToggleGrid>
            {GUN_LAW_OPTIONS.map((option) => (
              <TogglePill
                key={option}
                label={formatLabel(option)}
                active={filters.gunLaws.includes(option)}
                onClick={() => onToggle("gunLaws", option)}
              />
            ))}
          </ToggleGrid>
        </div>
      </FilterSection>

      <FilterSection title="Tech & industry" description="Spot innovation hubs or quieter markets.">
        <ToggleGrid>
          {TECH_OPTIONS.map((option) => (
            <TogglePill
              key={option}
              label={formatLabel(option)}
              active={filters.techPresence.includes(option)}
              onClick={() => onToggle("techPresence", option)}
            />
          ))}
        </ToggleGrid>
      </FilterSection>

      <FilterSection title="Cost & support" description="Balance budget with veteran resources.">
        <SliderControl
          label="Max cost of living index"
          min={70}
          max={140}
          step={2}
          value={filters.maxCostOfLiving}
          onChange={(value) => onUpdateFilters((prev) => ({ ...prev, maxCostOfLiving: value }))}
        />
        <SliderControl
          label="Minimum VA support score"
          min={0}
          max={5}
          step={1}
          value={filters.minVaScore}
          onChange={(value) => onUpdateFilters((prev) => ({ ...prev, minVaScore: value }))}
        />
      </FilterSection>

      <FilterSection title="Active filters" description="Fine tune or remove individual filters.">
        {activeFilters.length ? (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((pill) => (
              <PillBadge key={`${pill.category}-${pill.value}`} pill={pill} onRemove={onClearPill} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No filters applied yet.</p>
        )}
      </FilterSection>
    </div>
  );
}

function FilterSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-primary">{title}</h3>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function ToggleGrid({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function TogglePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-transparent bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] text-primary shadow-sm"
          : "border-color-border/60 bg-color-muted/20 text-muted-foreground hover:border-color-border hover:text-primary"
      }`}
    >
      {active ? (
        <svg
          className="size-3"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden
        >
          <path d="M3 6.5 5 8.5l4-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
      {label}
    </button>
  );
}

function Subheading({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-semibold text-secondary">{children}</h4>;
}

type SliderControlProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

function SliderControl({ label, min, max, step, value, onChange }: SliderControlProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-primary">{label}</span>
        <span className="rounded-full bg-color-muted/40 px-3 py-1 text-xs text-muted-foreground">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[var(--accent)]"
      />
      <div className="flex justify-between text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

type ActiveFilterBarProps = {
  pills: ActiveFilter[];
  onRemove: (pill: ActiveFilter) => void;
  onClearAll?: () => void;
};

function ActiveFilterBar({ pills, onRemove, onClearAll }: ActiveFilterBarProps) {
  if (!pills.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-color-border/60 bg-color-muted/25 px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Active filters</span>
      {pills.map((pill) => (
        <PillBadge key={`${pill.category}-${pill.value}`} pill={pill} onRemove={onRemove} />
      ))}
      {onClearAll ? (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-auto text-xs font-medium text-accent transition hover:text-accent-secondary"
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
}

type PillBadgeProps = {
  pill: ActiveFilter;
  onRemove: (pill: ActiveFilter) => void;
};

function PillBadge({ pill, onRemove }: PillBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-color-border/50 bg-color-muted/40 px-3 py-1 text-xs text-primary">
      <span className="text-muted-foreground/70">{pill.category}</span>
      <span className="font-medium text-primary">{pill.label}</span>
      <button
        type="button"
        onClick={() => onRemove(pill)}
        className="rounded-full p-1 transition hover:bg-color-muted/50"
        aria-label={`Remove filter ${pill.label}`}
      >
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
          <path d="M3 3l6 6M9 3 3 9" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

type ResultsGridProps = {
  destinations: Destination[];
  selectedId: string;
  onSelect: (id: string) => void;
};

function ResultsGrid({ destinations, selectedId, onSelect }: ResultsGridProps) {
  if (!destinations.length) {
    return (
      <div className="glass-panel flex flex-col items-center gap-4 px-8 py-16 text-center">
        <span className="rounded-full bg-color-muted/30 px-3 py-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          No matches yet
        </span>
        <p className="max-w-sm text-balance text-lg font-medium text-primary">
          Try widening your filters or exploring nearby regions to surface more options.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {destinations.map((destination) => (
        <DestinationCard
          key={destination.id}
          destination={destination}
          isSelected={destination.id === selectedId}
          onSelect={() => onSelect(destination.id)}
        />
      ))}
    </div>
  );
}

type DestinationCardProps = {
  destination: Destination;
  isSelected: boolean;
  onSelect: () => void;
};

function DestinationCard({ destination, isSelected, onSelect }: DestinationCardProps) {
  const badgeColor = `linear-gradient(120deg, var(--accent), var(--accent-secondary))`;

  return (
    <article
      className={`card-accent relative flex h-full flex-col gap-4 border border-color-border/60 p-5 transition ${
        isSelected ? "ring-2 ring-accent/60" : ""
      }`}
      onClick={onSelect}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      aria-pressed={isSelected}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-primary">
            {destination.name}, {destination.state}
          </h3>
          <p className="text-sm text-muted-foreground">{destination.summary}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-color-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            {destination.region}
          </span>
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ backgroundImage: badgeColor }}
          >
            VA {destination.vaResourcesScore}/5
          </span>
        </div>
      </header>
      <dl className="grid grid-cols-3 gap-3 text-xs">
        <Stat label="Taxes" value={formatLabel(destination.taxBand)} />
        <Stat label="Cost Index" value={destination.costOfLivingIndex.toString()} />
        <Stat label="Gun laws" value={formatLabel(destination.gunLaws)} />
      </dl>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {destination.climate.map((tag) => (
          <span key={tag} className="rounded-full bg-color-muted/40 px-3 py-1">
            {formatLabel(tag)}
          </span>
        ))}
        {destination.lifestyle.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded-full bg-color-muted/25 px-3 py-1">
            {formatLabel(tag)}
          </span>
        ))}
      </div>
      <footer className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 rounded-full border border-color-border/60 px-2 py-1">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
            {formatLabel(destination.techPresence)} tech
          </span>
          <span className="rounded-full border border-color-border/60 px-2 py-1">
            Healthcare {destination.healthcareIndex}
          </span>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {isSelected ? "Selected" : "Compare"}
        </span>
      </footer>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-color-border/50 bg-color-muted/35 px-3 py-2 text-center">
      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-primary">{value}</dd>
    </div>
  );
}

type InsightsPanelProps = {
  destination?: Destination;
};

function InsightsPanel({ destination }: InsightsPanelProps) {
  if (!destination) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">Select a destination to see veteran-specific insights.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-primary">
          Why {destination.name} stands out
        </h2>
        <p className="text-sm text-muted-foreground">
          {destination.summary}
        </p>
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Highlights
        </h3>
        <ul className="space-y-3 text-sm text-primary">
          {destination.highlights.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Snapshot
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <SnapshotCard label="Cost of living" value={destination.costOfLivingIndex.toString()} />
          <SnapshotCard label="VA support" value={`${destination.vaResourcesScore} / 5`} />
          <SnapshotCard label="Healthcare score" value={destination.healthcareIndex.toString()} />
          <SnapshotCard label="Gun laws" value={formatLabel(destination.gunLaws)} />
        </div>
      </div>
      <div className="mt-auto space-y-4 rounded-2xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-5 py-6">
        <h3 className="text-sm font-semibold text-primary">Next steps</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li>
            <strong className="text-primary">Schedule a discovery call.</strong> Match with local veteran ambassadors to discuss neighborhoods.
          </li>
          <li>
            <strong className="text-primary">Review benefits.</strong> Understand state-specific exemptions and resources before you move.
          </li>
        </ul>
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(120deg,var(--accent),var(--accent-secondary))] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
        >
          Save this destination
        </button>
      </div>
    </div>
  );
}

function SnapshotCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-color-border/50 bg-color-muted/40 px-3 py-4 text-center">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm font-semibold text-primary">{value}</div>
    </div>
  );
}

type MobileFilterSheetProps = FilterRailProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function MobileFilterSheet({ open, onOpenChange, ...props }: MobileFilterSheetProps) {
  return (
    <div
      className={`${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      } fixed inset-0 z-40 transition duration-300 lg:hidden`}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 max-h-[88dvh] rounded-t-3xl bg-surface p-6 shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Filters</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-color-border/60 p-2"
            aria-label="Close filters"
          >
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
              <path d="M4 4l8 8M12 4 4 12" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="h-[65dvh] overflow-y-auto pr-1">
          <FilterRail {...props} />
        </div>
      </div>
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .split(/[\s-]+/)
    .map((fragment) => fragment.charAt(0).toUpperCase() + fragment.slice(1))
    .join(" ");
}

