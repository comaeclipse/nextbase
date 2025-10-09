# Veterans Retirement Atlas - Project Overview

## Project Summary
A Next.js application that helps veterans compare relocation destinations across taxes, climate, cost of living, and state-level benefits. The application provides interactive exploration tools, maps, and detailed destination information to assist veterans in making informed retirement location decisions.

## Architecture & Technology Stack

### Frontend Framework
- **Next.js 15.5.4** with App Router
- **React 19.1.0** with TypeScript
- **Turbopack** for development and production builds
- **Tailwind CSS 4** for styling with PostCSS
- **Leaflet** + **React Leaflet** for interactive maps

### Backend & Database
- **PostgreSQL** (Neon) as primary database
- **JSON fallback** for read-only environments
- **pg** library for PostgreSQL connections
- **Connection pooling** for optimal performance

### Development Tools
- **TypeScript 5** for type safety
- **ESLint** with Next.js and TypeScript rules
- **Node.js 18+** runtime requirement

## Project Structure

```
veterans-retirement/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [state]/[city]/     # Dynamic destination pages
│   │   ├── api/destinations/   # API endpoints
│   │   ├── map/               # Map overview page
│   │   ├── quiz/              # Interactive quiz page
│   │   ├── layout.tsx         # Root layout with Postgres init
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── destination-map.tsx    # Interactive map component
│   │   ├── map-overview.tsx       # Map page wrapper
│   │   ├── retirement-explorer.tsx # Main explorer interface
│   │   ├── theme-provider.tsx     # Dark/light theme context
│   │   └── theme-toggle.tsx       # Theme switcher
│   ├── data/                  # Static data files
│   │   ├── destinations.json      # Fallback destination data
│   │   ├── city-coordinates.ts    # City lat/lng coordinates
│   │   └── destination-options.ts # Destination metadata
│   ├── lib/                   # Core business logic
│   │   ├── destination-store.ts       # Main data store interface
│   │   ├── destination-store-postgres.ts # PostgreSQL implementation
│   │   ├── postgres.ts              # Database connection & schema
│   │   └── init-postgres.ts         # Database initialization
│   └── types/                 # TypeScript type definitions
│       └── destination.ts         # Destination data model
├── scripts/                   # Utility scripts
│   ├── import-csv.ts          # CSV data import tool
│   ├── import_locations.py    # Python CSV processor
│   └── test-db-connection.ts  # Database connection tester
└── public/                    # Static assets
```

## Data Model

### Destination Interface
Each destination contains comprehensive data about:
- **Location**: City, state, county, coordinates
- **Demographics**: Population, density
- **Taxes**: Sales tax, income tax rates
- **Politics**: State/governor/mayor party affiliations
- **Laws**: Marijuana status, firearm laws, gun control scores
- **Climate**: Weather patterns, snowfall, rainfall, sunny days
- **Economics**: Gas prices, cost of living index
- **Benefits**: Veteran-specific benefits and VA support
- **Quality of Life**: LGBTQ+ scores, tech hub status, military hub
- **Elections**: 2016/2024 election results and trends

### Database Schema
```sql
CREATE TABLE destinations (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_destinations_city ON destinations ((payload->>'city'));
CREATE INDEX idx_destinations_state ON destinations ((payload->>'state'));
```

## Key Features

### 1. Interactive Explorer (`/`)
- **Multi-select filtering** by lifestyle preferences:
  - Mild winters
  - Near ocean
  - Snow adventures
  - Cheap gas prices
- **Search functionality** across cities, states, and veteran benefits
- **Grid/Table view toggle** for different data presentation
- **Real-time filtering** with React state management

### 2. Destination Detail Pages (`/[state]/[city]`)
- **Comprehensive destination profiles** with all available data
- **Political information** with color-coded party badges
- **Climate data** including weather patterns and statistics
- **Economic indicators** like cost of living and gas prices
- **Veteran-specific benefits** and VA support information

### 3. Interactive Map (`/map`)
- **Leaflet-based map** showing all destinations
- **Hover tooltips** with key destination information
- **Geographic visualization** of destination distribution
- **Missing destinations tracking** for data completeness

### 4. Lifestyle Quiz (`/quiz`)
- **Interactive questionnaire** to match preferences
- **Recommendation engine** based on user responses
- **Personalized suggestions** for ideal destinations

### 5. API Endpoints (`/api/destinations`)
- **RESTful API** for destination data access
- **JSON response format** for external integrations
- **Error handling** with appropriate HTTP status codes

## Environment Configuration

### Local Development
- **Node.js 18+** required
- **PostgreSQL connection** via `DATABASE_URL` environment variable
- **Turbopack** for fast development builds
- **Hot reload** with `npm run dev`

### Production (Vercel)
- **Vercel Project ID**: `prj_sAkvxSt9gIlnPE4EjF42nmPUvCUk`
- **Neon PostgreSQL** database with connection pooling
- **Edge functions** support for optimal performance
- **Automatic deployments** from GitHub main branch

### Database Configuration
- **Primary**: Neon PostgreSQL with SSL
- **Fallback**: JSON file for read-only environments
- **Connection pooling** for optimal performance
- **Automatic schema initialization** on first run
- **Data migration** from JSON to PostgreSQL

## Data Management

### Import Process
1. **CSV Processing**: Python script (`import_locations.py`) processes raw CSV data
2. **TypeScript Import**: `import-csv.ts` provides additional processing capabilities
3. **JSON Generation**: Creates structured `destinations.json` file
4. **Database Seeding**: Automatic migration to PostgreSQL on first run

### Data Sources
- **Primary CSV**: `C:\Users\Meeter\Downloads\Locations.csv`
- **Gun Laws CSV**: `C:\Users\Meeter\Downloads\Gunlaws.csv`
- **City Coordinates**: Manual coordinate mapping in `city-coordinates.ts`

## Deployment & CI/CD

### GitHub Integration
- **Repository**: `https://github.com/comaeclipse/nextbase.git`
- **Branch**: `main` (production deployments)
- **Automatic deployments** on push to main

### Vercel Configuration
- **Build Command**: `next build --turbopack`
- **Output Directory**: `.next`
- **Node.js Version**: 18.x
- **Environment Variables**: Configured for Neon PostgreSQL

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://neondb_owner:npg_S9FQJb3khcRX@ep-little-firefly-adc7dh17-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_S9FQJb3khcRX@ep-little-firefly-adc7dh17.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# Neon Auth (Stack)
NEXT_PUBLIC_STACK_PROJECT_ID=e3f3bf2b-e10d-4037-abe4-f7efe42e65ee
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_zsandx4s8r2a0snpk0w131js5qktv43w124p0ty2ehfd0
STACK_SECRET_SERVER_KEY=ssk_xpnt3w50qm7v4eypmyd043bwbpw56nq913mderry1jk58
```

## Development Workflow

### Local Setup
1. **Clone repository**: `git clone https://github.com/comaeclipse/nextbase.git`
2. **Install dependencies**: `npm install`
3. **Set environment variables**: Create `.env.local` with `DATABASE_URL`
4. **Start development**: `npm run dev`
5. **Test database**: `npx tsx scripts/test-db-connection.ts`

### Data Updates
1. **Update CSV files** in Downloads directory
2. **Run import script**: `python scripts/import_locations.py`
3. **Commit changes**: `git add . && git commit -m "Update destinations"`
4. **Deploy**: `git push origin main`

### Testing
- **Database connection**: `npx tsx scripts/test-db-connection.ts`
- **Build verification**: `npm run build`
- **Linting**: `npm run lint`

## Performance Optimizations

### Database
- **Connection pooling** with pg library
- **JSONB indexing** on frequently queried fields
- **Read-only fallback** for edge environments

### Frontend
- **Dynamic imports** for map components (SSR disabled)
- **Memoized filtering** with React.useMemo
- **Optimized re-renders** with proper state management

### Build
- **Turbopack** for faster builds
- **Tree shaking** for smaller bundles
- **Static generation** where possible

## Security Considerations

### Database
- **SSL connections** in production
- **Connection string security** via environment variables
- **Read-only environments** for edge functions

### API
- **Error handling** without sensitive data exposure
- **Input validation** for dynamic routes
- **CORS configuration** for external access

## Monitoring & Maintenance

### Logging
- **Database connection status** logging
- **Migration progress** tracking
- **Error handling** with detailed messages

### Health Checks
- **Database connectivity** verification
- **Schema initialization** status
- **Data migration** completion tracking

## Future Enhancements

### Potential Improvements
- **User authentication** for personalized recommendations
- **Favorites system** for saved destinations
- **Advanced filtering** with more criteria
- **Export functionality** for destination lists
- **Mobile optimization** for better mobile experience
- **Analytics integration** for usage tracking

### Technical Debt
- **Remove SQLite dependencies** (already migrated to PostgreSQL)
- **Optimize map performance** for large datasets
- **Add comprehensive error boundaries**
- **Implement caching strategies** for better performance

## Dependencies

### Production
- `next`: 15.5.4 - React framework
- `react`: 19.1.0 - UI library
- `react-dom`: 19.1.0 - React DOM
- `pg`: ^8.16.3 - PostgreSQL client
- `leaflet`: ^1.9.4 - Map library
- `react-leaflet`: ^5.0.0 - React map components
- `dotenv`: ^17.2.3 - Environment variables

### Development
- `typescript`: ^5 - Type system
- `eslint`: ^9 - Code linting
- `tailwindcss`: ^4 - CSS framework
- `@types/*`: Type definitions

## Contact & Support
- **Repository**: https://github.com/comaeclipse/nextbase.git
- **Vercel Project**: prj_sAkvxSt9gIlnPE4EjF42nmPUvCUk
- **Database**: Neon PostgreSQL (ep-little-firefly-adc7dh17)

---

*Last updated: $(date)*
*Project version: 0.1.0*
