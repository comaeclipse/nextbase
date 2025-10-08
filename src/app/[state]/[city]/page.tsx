import { notFound } from "next/navigation";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { loadDestinations } from "@/lib/destination-store";

function toCitySegment(city: string) {
  return city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatPartyBadge(party: string) {
  const normalized = party.toLowerCase();
  if (normalized === "republican") {
    return <span className="inline-block rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">Republican</span>;
  }
  if (normalized === "democrat") {
    return <span className="inline-block rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">Democrat</span>;
  }
  return <span className="inline-block rounded-full bg-gray-500/20 px-2 py-0.5 text-xs font-medium text-gray-400">{party}</span>;
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ state: string; city: string }>;
}) {
  const { state, city } = await params;
  const destinations = await loadDestinations();

  const destination = destinations.find(
    (d) =>
      d.stateCode.toLowerCase() === state.toLowerCase() &&
      toCitySegment(d.city) === city.toLowerCase()
  );

  if (!destination) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {destination.state}
          </p>
          <h1 className="text-4xl font-bold text-gradient">{destination.city}</h1>
          <p className="text-sm text-muted-foreground">{destination.county} County</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-color-border/60 px-5 py-2 text-xs font-semibold transition hover:text-primary whitespace-nowrap"
          >
            Back to explorer
          </Link>
          <ThemeToggle size="sm" />
        </div>
      </header>

      {/* Overview Stats */}
      <section className="glass-panel p-6">
        <h2 className="mb-4 text-2xl font-semibold text-primary">Overview</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Population</p>
            <p className="text-2xl font-semibold text-primary">
              {destination.population ? destination.population.toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Density (per sq mi)</p>
            <p className="text-2xl font-semibold text-primary">
              {destination.density ? destination.density.toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cost of Living Index</p>
            <p className="text-2xl font-semibold text-primary">
              {destination.costOfLiving}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({destination.costOfLivingLabel})
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sales Tax</p>
            <p className="text-2xl font-semibold text-primary">{destination.salesTax.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Income Tax</p>
            <p className="text-2xl font-semibold text-primary">{destination.incomeTax.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gas Price</p>
            <p className="text-2xl font-semibold text-primary">${destination.gasPrice.toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* Climate & Weather */}
      <section className="glass-panel p-6">
        <h2 className="mb-4 text-2xl font-semibold text-primary">Climate & Weather</h2>
        <p className="mb-4 text-sm text-muted-foreground">{destination.climate}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="text-sm text-muted-foreground">Sunny Days</p>
            <p className="text-xl font-semibold text-primary">{destination.sunnyDays}</p>
          </div>
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="text-sm text-muted-foreground">Average Low Winter (°F)</p>
            <p className="text-xl font-semibold text-primary">
              {typeof destination.alwScore === "number" ? `${destination.alwScore}° F` : "N/A"}
            </p>
          </div>
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="text-sm text-muted-foreground">Average High Summer (°F)</p>
            <p className="text-xl font-semibold text-primary">
              {typeof destination.ahsScore === "number" ? `${destination.ahsScore}° F` : "N/A"}
            </p>
          </div>
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="text-sm text-muted-foreground">Snowfall (inches)</p>
            <p className="text-xl font-semibold text-primary">{destination.snowfall}</p>
          </div>
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="text-sm text-muted-foreground">Rainfall (inches)</p>
            <p className="text-xl font-semibold text-primary">{destination.rainfall}</p>
          </div>
        </div>
      </section>


      {/* Politics */}
      <section className="glass-panel p-6">
        <h2 className="mb-4 text-2xl font-semibold text-primary">Political Landscape</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <span className="text-sm text-muted-foreground">State Party Control</span>
            {formatPartyBadge(destination.stateParty)}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <span className="text-sm text-muted-foreground">Governor</span>
            {formatPartyBadge(destination.governorParty)}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <span className="text-sm text-muted-foreground">City Political Lean</span>
            <span className="text-sm font-semibold text-primary text-right">
              {destination.cityPoliticalLean}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="mb-2 text-sm text-muted-foreground">2016 Election</p>
            <p className="text-lg font-semibold text-primary">
              {destination.election2016Winner} - {destination.election2016Percent}%
            </p>
          </div>
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="mb-2 text-sm text-muted-foreground">2024 Election</p>
            <p className="text-lg font-semibold text-primary">
              {destination.election2024Winner} - {destination.election2024Percent}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{destination.electionChange}</p>
          </div>
        </div>
      </section>

      {/* Firearm Laws */}
      <section className="glass-panel p-6">
        <h2 className="mb-4 text-2xl font-semibold text-primary">Firearm Laws</h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="mb-2 text-sm text-muted-foreground">Giffords Law Center Score</p>
            <p className="text-xl font-semibold text-primary">{destination.giffordScore}</p>
            <p className="mt-1 text-xs text-muted-foreground capitalize">
              Overall: {destination.firearmLaws}
            </p>
          </div>
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="mb-2 text-sm text-muted-foreground">Magazine Capacity Restrictions</p>
            <p className="text-sm text-primary">{destination.magazineLimit}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
              <p className="mb-2 text-sm text-muted-foreground">Ghost Gun Ban</p>
              <p className="text-lg font-semibold text-primary">
                {destination.ghostGunBan ? "Yes" : "No"}
              </p>
            </div>
            <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
              <p className="mb-2 text-sm text-muted-foreground">Assault Weapon Ban</p>
              <p className="text-lg font-semibold text-primary">
                {destination.assaultWeaponBan ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Other Metrics */}
      <section className="glass-panel p-6">
        <h2 className="mb-4 text-2xl font-semibold text-primary">Additional Information</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="mb-2 text-sm text-muted-foreground">Marijuana Status</p>
            <p className="text-lg font-semibold capitalize text-primary">{destination.marijuanaStatus}</p>
          </div>
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="mb-2 text-sm text-muted-foreground">VA Support</p>
            <p className="text-lg font-semibold text-primary">{destination.vaSupport ? "Yes" : "No"}</p>
          </div>
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="mb-2 text-sm text-muted-foreground">Tech Hub</p>
            <p className="text-lg font-semibold text-primary">{destination.techHub ? "Yes" : "No"}</p>
          </div>
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="mb-2 text-sm text-muted-foreground">LGBTQ+ Equality Score</p>
            <p className="text-lg font-semibold text-primary">
              {destination.lgbtqScore || 'Not rated'}
            </p>
          </div>
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="mb-2 text-sm text-muted-foreground">Military Hub Presence</p>
            <p className="text-lg font-semibold text-primary">{destination.militaryHub ? "Yes" : "No"}</p>
          </div>
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="mb-2 text-sm text-muted-foreground">Nearest VA Facility</p>
            <p className="text-lg font-semibold text-primary">
              {destination.nearestVA || "Not listed"}
            </p>
          </div>
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="mb-2 text-sm text-muted-foreground">Distance to VA</p>
            <p className="text-lg font-semibold text-primary">
              {destination.distanceToVA || "Not listed"}
            </p>
          </div>
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="mb-2 text-sm text-muted-foreground">Summer Humidity</p>
            <p className="text-lg font-semibold text-primary">
              {destination.humiditySummer ? `${destination.humiditySummer}%` : "Not listed"}
            </p>
          </div>
        </div>

        {destination.description ? (
          <div className="mt-4 rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="mb-2 text-sm text-muted-foreground">Why it stands out</p>
            <p className="text-sm leading-relaxed text-primary">{destination.description}</p>
          </div>
        ) : null}

        {destination.veteranBenefits && destination.veteranBenefits !== 'No state-specific veteran benefit noted.' && (
          <div className="mt-4 rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="mb-2 text-sm text-muted-foreground">Veteran Benefits</p>
            <p className="text-sm text-primary">{destination.veteranBenefits}</p>
          </div>
        )}
      </section>

      {/* Quality of Life Scores */}
      <section className="glass-panel p-6">
        <h2 className="mb-4 text-2xl font-semibold text-primary">Quality of Life Scores</h2>
        <p className="mb-4 text-sm text-muted-foreground">Use this snapshot to weigh everyday livability alongside the seasonal highs and lows above.</p>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-color-border/50 bg-color-surface/40 p-4">
            <p className="mb-2 text-sm text-muted-foreground">TCI Score</p>
            <p className="text-xl font-semibold text-primary">{destination.tciScore}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
