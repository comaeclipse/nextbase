# Veterans Relocation Explorer

A Next.js app that helps veterans compare relocation destinations across taxes, climate, cost of living, and state-level benefits. The app no longer depends on Postgres/Prisma; data now lives in a checked-in JSON file that is easy to maintain without a database.

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

Destinations are stored in `src/data/destinations.json`. Each record uses the following shape:

```json
{
  "id": "houston-texas",
  "city": "Houston",
  "state": "Texas",
  "governorParty": "republican",
  "salesTax": 8.25,
  "incomeTax": 0,
  "marijuanaStatus": "medical",
  "firearmLaws": "permissive",
  "giffordScore": "F",
  "veteranBenefits": "Partial property tax reduction for eligible veterans and surviving spouses.",
  "climate": "Humid subtropical with roughly 204 sunny days per year.",
  "snowfall": 15,
  "rainfall": 47,
  "gasPrice": 2.74,
  "costOfLiving": 85,
  "costOfLivingLabel": "Low/Medium",
  "sunnyDays": 204
}
```

### Updating Destinations

The dataset is static. Edit `src/data/destinations.json` directly and commit the changes whenever you need to add, update, or remove locations. To regenerate the file from the provided CSV, run `python scripts/import_locations.py`.

## API

- `GET /api/destinations`: returns the JSON data so you can integrate with other tools or sanity-check deployments.

## Deployment Notes

- The project builds with `next build --turbopack` (see `npm run build`).
- Because the data source is a static JSON file, remember to commit any changes made in development before deploying.
