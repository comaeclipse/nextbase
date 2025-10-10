'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import type { Destination } from '@/types/destination';

type SortField = 'city' | 'state' | 'population' | 'costOfLiving' | 'salesTax' | 'density' | 'gasPrice';
type SortDirection = 'asc' | 'desc';

export default function AdminDashboard() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [sortField, setSortField] = useState<SortField>('city');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = sessionStorage.getItem('admin_token');
      
      if (!token) {
        router.push('/admin');
        return;
      }

      try {
        const response = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          sessionStorage.removeItem('admin_token');
          router.push('/admin');
          return;
        }

        setAuthenticated(true);
        
        // Fetch destinations
        const destResponse = await fetch('/api/destinations');
        const data = await destResponse.json();
        setDestinations(data);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/admin');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    router.push('/admin');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredDestinations = useMemo(() => {
    let filtered = destinations;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(dest =>
        dest.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortField) {
        case 'city':
          aVal = a.city;
          bVal = b.city;
          break;
        case 'state':
          aVal = a.state;
          bVal = b.state;
          break;
        case 'population':
          aVal = a.population;
          bVal = b.population;
          break;
        case 'costOfLiving':
          aVal = a.costOfLiving;
          bVal = b.costOfLiving;
          break;
        case 'salesTax':
          aVal = a.salesTax;
          bVal = b.salesTax;
          break;
        case 'density':
          aVal = a.density;
          bVal = b.density;
          break;
        case 'gasPrice':
          aVal = a.gasPrice;
          bVal = b.gasPrice;
          break;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortDirection === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });
  }, [destinations, sortField, sortDirection, searchTerm]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">⇅</span>;
    }
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-primary">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-color-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-sm font-semibold text-primary hover:text-accent transition-colors"
            >
              ← Back to Home
            </Link>
            <Link 
              href="/server" 
              className="text-sm font-semibold text-primary hover:text-accent transition-colors"
            >
              Server Stats
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="rounded-lg border border-color-border/60 px-4 py-2 text-sm font-semibold text-primary hover:bg-color-muted/30 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and view destination data ({destinations.length} total destinations)
          </p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by city or state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md rounded-lg border border-color-border/60 bg-transparent px-4 py-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          {searchTerm && (
            <p className="mt-2 text-sm text-muted-foreground">
              Showing {sortedAndFilteredDestinations.length} of {destinations.length} destinations
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-color-border/60 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-color-muted/30 border-b border-color-border/60">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider cursor-pointer hover:bg-color-muted/50 transition-colors"
                    onClick={() => handleSort('city')}
                  >
                    <div className="flex items-center gap-2">
                      City <SortIcon field="city" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider cursor-pointer hover:bg-color-muted/50 transition-colors"
                    onClick={() => handleSort('state')}
                  >
                    <div className="flex items-center gap-2">
                      State <SortIcon field="state" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-xs font-semibold text-primary uppercase tracking-wider cursor-pointer hover:bg-color-muted/50 transition-colors"
                    onClick={() => handleSort('population')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Population <SortIcon field="population" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-xs font-semibold text-primary uppercase tracking-wider cursor-pointer hover:bg-color-muted/50 transition-colors"
                    onClick={() => handleSort('costOfLiving')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Cost of Living <SortIcon field="costOfLiving" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-xs font-semibold text-primary uppercase tracking-wider cursor-pointer hover:bg-color-muted/50 transition-colors"
                    onClick={() => handleSort('salesTax')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Sales Tax <SortIcon field="salesTax" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-xs font-semibold text-primary uppercase tracking-wider cursor-pointer hover:bg-color-muted/50 transition-colors"
                    onClick={() => handleSort('density')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Density <SortIcon field="density" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-xs font-semibold text-primary uppercase tracking-wider cursor-pointer hover:bg-color-muted/50 transition-colors"
                    onClick={() => handleSort('gasPrice')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Gas Price <SortIcon field="gasPrice" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-primary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-color-border/60">
                {sortedAndFilteredDestinations.map((dest) => (
                  <tr 
                    key={dest.id}
                    className="hover:bg-color-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      <Link
                        href={`/admin/destinations/${dest.id}`}
                        className="text-accent hover:text-accent-secondary transition-colors"
                      >
                        {dest.city}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {dest.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground text-right">
                      {dest.population.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground text-right">
                      {dest.costOfLiving}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground text-right">
                      {dest.salesTax}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground text-right">
                      {dest.density.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground text-right">
                      ${dest.gasPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Link
                        href={`/${dest.stateCode.toLowerCase()}/${dest.city.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-accent hover:text-accent-secondary font-medium transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sortedAndFilteredDestinations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No destinations found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}

