# Veterans Relocation Explorer

A Next.js app that helps veterans compare relocation destinations across taxes, climate, cost of living, and state-level benefits. The app no longer depends on Postgres/Prisma; data now lives in a checked-in JSON file that is easy to maintain without a database.

## Prerequisites

- Node.js 18+
- `ADMIN_DASHBOARD_TOKEN` environment variable set for any environment that should allow admin access

## Key Scripts

```bash
npm run dev      # local development with Turbopack
npm run build    # production build
npm run start    # run the compiled build
npm run lint     # lint the project
```

## Data Source

Destinations are stored in `src/data/destinations.json`. Each record uses the following schema:

```json
{
  "id": "houston-tx",
  "city": "Houston",
  "state": "Texas",
  "governorName": "Greg Abbott",
  "governorParty": "republican",
  "salesTax": 8.25,
  "incomeTax": 0,
  "marijuanaStatus": "medical",
  "firearmLaws": "permissive",
  "veteranBenefits": "Partial property tax reduction for eligible veterans and surviving spouses.",
  "climate": "Humid subtropical with roughly 204 sunny days per year.",
  "snowfall": 15,
  "rainfall": 47,
  "gasPrice": 2.74,
  "costOfLiving": 60.6
}
```

### Editing Destinations

1. Manually edit `src/data/destinations.json`, or
2. Sign into `/admin` with the `ADMIN_DASHBOARD_TOKEN` cookie and use the UI forms.

> **Note:** When deployed to read-only environments (e.g., Vercel), server actions cannot persist changes back to the repository. In those cases, edit and commit the JSON file directly.

## Admin Dashboard

- Set `ADMIN_DASHBOARD_TOKEN` locally (e.g. in `.env.local`) and redeploy after updating the value in production.
- Navigate to `/admin`, enter the token, and manage destinations via the provided forms.
- Clicking **Sign out** clears the admin cookie.

## API

- `GET /api/destinations`: returns the JSON data so you can integrate with other tools or sanity-check deployments.

## Deployment Notes

- The project builds with `next build --turbopack` (see `npm run build`).
- Because the data source is a static JSON file, remember to commit any changes made in development before deploying.
