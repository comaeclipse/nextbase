import { pool } from '@/lib/postgres';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

type SuccessStats = {
  success: true;
  queryTime: number;
  serverTime: Date;
  postgresVersion: string;
  dbSize: string;
  destinationCount: number;
  tableSize: string;
  dataSize: string;
  indexSize: string;
  activeConnections: number;
  oldestConnection: Date | null;
  indexes: Array<{
    index_name: string;
    index_scans: string;
    tuples_read: string;
    tuples_fetched: string;
  }>;
};

type ErrorStats = {
  success: false;
  error: string;
  queryTime: number;
};

type ServerStats = SuccessStats | ErrorStats;

async function getServerStats(): Promise<ServerStats> {
  const startTime = Date.now();
  
  try {
    const client = await pool.connect();
    
    try {
      // Get current timestamp from database
      const timeResult = await client.query('SELECT NOW() as server_time, version() as postgres_version');
      const queryTime = Date.now() - startTime;
      
      // Get database size
      const dbSizeResult = await client.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
      `);
      
      // Get destinations count
      const countResult = await client.query('SELECT COUNT(*) as count FROM destinations');
      
      // Get table size
      const tableSizeResult = await client.query(`
        SELECT 
          pg_size_pretty(pg_total_relation_size('destinations')) as total_size,
          pg_size_pretty(pg_relation_size('destinations')) as table_size,
          pg_size_pretty(pg_indexes_size('destinations')) as indexes_size
      `);
      
      // Get connection info
      const connectionResult = await client.query(`
        SELECT 
          count(*) as active_connections,
          max(backend_start) as oldest_connection
        FROM pg_stat_activity
        WHERE datname = current_database()
      `);
      
      // Get index info
      const indexResult = await client.query(`
        SELECT 
          indexrelname as index_name,
          idx_scan as index_scans,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC
      `);
      
      return {
        success: true,
        queryTime,
        serverTime: timeResult.rows[0].server_time,
        postgresVersion: timeResult.rows[0].postgres_version,
        dbSize: dbSizeResult.rows[0].db_size,
        destinationCount: parseInt(countResult.rows[0].count),
        tableSize: tableSizeResult.rows[0].total_size,
        dataSize: tableSizeResult.rows[0].table_size,
        indexSize: tableSizeResult.rows[0].indexes_size,
        activeConnections: parseInt(connectionResult.rows[0].active_connections),
        oldestConnection: connectionResult.rows[0].oldest_connection,
        indexes: indexResult.rows,
      };
    } finally {
      client.release();
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      queryTime: Date.now() - startTime,
    };
  }
}

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ServerPage() {
  const stats = await getServerStats();
  
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gradient">Server Stats</h1>
          <p className="text-sm text-muted-foreground">
            Database connection details and performance metrics
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

      {!stats.success ? (
        <section className="glass-panel p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-500">Connection Error</h2>
            <p className="mt-2 text-sm text-muted-foreground">{stats.error}</p>
            <p className="mt-4 text-xs text-muted-foreground">Query took {stats.queryTime}ms</p>
          </div>
        </section>
      ) : (
        <>
          {/* Connection Performance */}
          <section className="glass-panel space-y-4 p-6">
            <h2 className="text-xl font-semibold text-gradient">Connection Performance</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-color-border/40 bg-card/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Query Time</p>
                <p className="mt-2 text-2xl font-bold text-primary">{stats.queryTime}ms</p>
              </div>
              <div className="rounded-lg border border-color-border/40 bg-card/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Server Time</p>
                <p className="mt-2 text-sm font-mono text-primary">
                  {new Date(stats.serverTime).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                  })}
                </p>
              </div>
              <div className="rounded-lg border border-color-border/40 bg-card/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Connections</p>
                <p className="mt-2 text-2xl font-bold text-primary">{stats.activeConnections}</p>
              </div>
            </div>
          </section>

          {/* Database Info */}
          <section className="glass-panel space-y-4 p-6">
            <h2 className="text-xl font-semibold text-gradient">Database Information</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-color-border/20 pb-2">
                <span className="text-sm font-medium text-muted-foreground">PostgreSQL Version</span>
                <span className="text-sm font-mono text-primary">{stats.postgresVersion.split(' ')[0]} {stats.postgresVersion.split(' ')[1]}</span>
              </div>
              <div className="flex items-center justify-between border-b border-color-border/20 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Database Size</span>
                <span className="text-sm font-semibold text-primary">{stats.dbSize}</span>
              </div>
              <div className="flex items-center justify-between border-b border-color-border/20 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Environment</span>
                <span className="text-sm font-semibold text-primary">
                  {process.env.VERCEL ? 'Vercel' : 'Local'} 
                  {process.env.NEXT_RUNTIME === 'edge' ? ' (Edge)' : ' (Node.js)'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-color-border/20 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Connection Pool</span>
                <span className="text-sm font-semibold text-primary">
                  {process.env.DATABASE_URL?.includes('pooler') ? 'Enabled (pgBouncer)' : 'Direct'}
                </span>
              </div>
            </div>
          </section>

          {/* Table Stats */}
          <section className="glass-panel space-y-4 p-6">
            <h2 className="text-xl font-semibold text-gradient">Destinations Table</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-color-border/40 bg-card/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Records</p>
                <p className="mt-2 text-2xl font-bold text-primary">{stats.destinationCount.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-color-border/40 bg-card/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Size</p>
                <p className="mt-2 text-2xl font-bold text-primary">{stats.tableSize}</p>
              </div>
              <div className="rounded-lg border border-color-border/40 bg-card/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data Size</p>
                <p className="mt-2 text-2xl font-bold text-primary">{stats.dataSize}</p>
              </div>
              <div className="rounded-lg border border-color-border/40 bg-card/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Index Size</p>
                <p className="mt-2 text-2xl font-bold text-primary">{stats.indexSize}</p>
              </div>
            </div>
          </section>

          {/* Index Performance */}
          <section className="glass-panel space-y-4 p-6">
            <h2 className="text-xl font-semibold text-gradient">Index Performance</h2>
            {stats.indexes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No index statistics available yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-color-border/40">
                      <th className="pb-2 text-left font-semibold text-muted-foreground">Index Name</th>
                      <th className="pb-2 text-right font-semibold text-muted-foreground">Scans</th>
                      <th className="pb-2 text-right font-semibold text-muted-foreground">Tuples Read</th>
                      <th className="pb-2 text-right font-semibold text-muted-foreground">Tuples Fetched</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.indexes.map((index: { index_name: string; index_scans: string; tuples_read: string; tuples_fetched: string }) => (
                      <tr key={index.index_name} className="border-b border-color-border/20">
                        <td className="py-2 font-mono text-xs text-primary">{index.index_name}</td>
                        <td className="py-2 text-right text-primary">{parseInt(index.index_scans).toLocaleString()}</td>
                        <td className="py-2 text-right text-primary">{parseInt(index.tuples_read).toLocaleString()}</td>
                        <td className="py-2 text-right text-primary">{parseInt(index.tuples_fetched).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Connection Details */}
          <section className="glass-panel space-y-4 p-6">
            <h2 className="text-xl font-semibold text-gradient">Connection Details</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-color-border/20 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Database Host</span>
                <span className="text-sm font-mono text-primary">
                  {process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-color-border/20 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Database Name</span>
                <span className="text-sm font-mono text-primary">
                  {process.env.DATABASE_URL?.split('/').pop()?.split('?')[0] || 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-color-border/20 pb-2">
                <span className="text-sm font-medium text-muted-foreground">SSL Mode</span>
                <span className="text-sm font-semibold text-primary">
                  {process.env.DATABASE_URL?.includes('sslmode=require') ? 'Required' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-color-border/20 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Oldest Connection</span>
                <span className="text-sm font-mono text-primary">
                  {stats.oldestConnection ? new Date(stats.oldestConnection).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                  }) : 'N/A'}
                </span>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

