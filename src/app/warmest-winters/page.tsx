import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { WarmestWintersView, type WarmWinterCity } from "@/components/warmest-winters-view";
import { pool } from "@/lib/postgres";

type WarmWinterCityRow = {
  id: string;
  city: string;
  state: string;
  avg_winter_low: number | null;
  avg_summer_high: number | null;
  sunny_days: number | null;
  cost_of_living: number | null;
  cost_of_living_label: string | null;
  climate: string | null;
  description: string | null;
};

async function getWarmWinterCities(): Promise<WarmWinterCity[]> {
  const client = await pool.connect();

  try {
    const result = await client.query<WarmWinterCityRow>(
      `
      SELECT
        payload->>'id' AS id,
        payload->>'city' AS city,
        payload->>'state' AS state,
        NULLIF(payload->>'alwScore', '')::numeric AS avg_winter_low,
        NULLIF(payload->>'ahsScore', '')::numeric AS avg_summer_high,
        NULLIF(payload->>'sunnyDays', '')::numeric AS sunny_days,
        NULLIF(payload->>'costOfLiving', '')::numeric AS cost_of_living,
        payload->>'costOfLivingLabel' AS cost_of_living_label,
        payload->>'climate' AS climate,
        payload->>'description' AS description
      FROM destinations
      WHERE (payload->>'alwScore') ~ '^[0-9]+(\\.[0-9]+)?$'
      ORDER BY (payload->>'alwScore')::numeric DESC, (payload->>'sunnyDays')::numeric DESC
      LIMIT 10
      `
    );

    return result.rows.map((row) => ({
      id: row.id,
      city: row.city,
      state: row.state,
      avgWinterLow: Number(row.avg_winter_low ?? 0),
      avgSummerHigh: Number(row.avg_summer_high ?? 0),
      sunnyDays: Number(row.sunny_days ?? 0),
      costOfLiving: Number(row.cost_of_living ?? 0),
      costOfLivingLabel: row.cost_of_living_label ?? "Not specified",
      climate: row.climate ?? "Climate details unavailable.",
      description: row.description ?? "",
    }));
  } finally {
    client.release();
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WarmestWintersPage() {
  const cities = await getWarmWinterCities();

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Climate playbook
          </p>
          <h1 className="text-3xl font-semibold text-gradient">Warmest winter destinations</h1>
          <p className="text-sm text-muted-foreground">
            These cities boast the highest average winter lows in our database—perfect for veterans who
            want to skip the deep freeze while keeping an eye on cost, sunshine, and quality of life.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-color-border/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition hover:text-primary"
          >
            Back to explorer
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <WarmestWintersView cities={cities} />
    </main>
  );
}
