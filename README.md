# Veterans Relocation Explorer

A Next.js app that helps veterans compare relocation destinations across taxes, climate, cost of living, and state-level benefits. The project now persists records in a lightweight SQLite database that lives alongside the source code—no external database server required.

## Prerequisites

- Node.js 18+

## Key Scripts

```bash
npm run dev      # local development with Turbopack
npm run build    # production build
npm run start    # run the compiled build
npm run lint     # lint the project
```

## Data Source

- Primary store: `src/data/destinations.sqlite` (auto-created on first run).
- Seed data + read-only fallback: `src/data/destinations.json`.

Each destination record uses the following shape:

```json
{
  "id": "houston-texas",
  "stateCode": "TX",
  "city": "Houston",
  "county": "Harris",
  "state": "Texas",
  "stateParty": "republican",
  "governorParty": "republican",
  "mayorParty": "republican",
  "population": 7122240,
  "density": 3126,
  "salesTax": 8.25,
  "incomeTax": 0,
  "marijuanaStatus": "medical",
  "firearmLaws": "permissive",
  "giffordScore": "F",
  "veteranBenefits": "Partial property tax reduction",
  "climate": "Humid subtropical with roughly 204 sunny days per year.",
  "snowfall": 15,
  "rainfall": 47,
  "gasPrice": 2.74,
  "costOfLiving": 94,
  "costOfLivingLabel": "Low/Medium",
  "sunnyDays": 204,
  "lgbtqScore": 103,
  "techHub": true,
  "vaSupport": false,
  "tciScore": 35,
  "alwScore": 44,
  "ahsScore": 92,
  "election2016Winner": "Trump",
  "election2016Percent": 48,
  "election2024Winner": "Trump",
  "election2024Percent": 51,
  "electionChange": "3% more Republican"
}
```

### Updating Destinations

1. If you want to refresh the dataset from the provided CSV, run `python scripts/import_locations.py` to regenerate `src/data/destinations.json`.
2. Remove `src/data/destinations.sqlite` (or run the app in an empty directory) so the store reseeds itself from the updated JSON file the next time the server boots.
3. Alternatively, use your favorite SQLite client to edit `src/data/destinations.sqlite` directly; the app reads and writes through this file in local environments.

## API

- `GET /api/destinations`: returns the JSON data so you can integrate with other tools or sanity-check deployments.

## Deployment Notes

- The project builds with `next build --turbopack` (see `npm run build`).
- Commit the generated SQLite file (`src/data/destinations.sqlite`) if you change it locally so deployments pick up the latest data. In read-only environments (Vercel edge or serverless), the app falls back to the bundled JSON seed.
