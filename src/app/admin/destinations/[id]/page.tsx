'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Destination, GovernorParty, MarijuanaStatus, FirearmLaw, CostOfLivingLabel } from '@/types/destination';
import { ThemeToggle } from '@/components/theme-toggle';

type DestinationForm = Destination;

const governorPartyOptions: GovernorParty[] = ['democrat', 'republican', 'independent', 'nonpartisan'];
const marijuanaOptions: MarijuanaStatus[] = ['recreational', 'medical', 'decriminalized', 'illegal'];
const firearmOptions: FirearmLaw[] = ['permissive', 'moderate', 'restrictive'];
const colLabelOptions: CostOfLivingLabel[] = ['Low', 'Low/Medium', 'Medium', 'High', 'Very High'];

export default function EditDestinationPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [form, setForm] = useState<DestinationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const token = sessionStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin');
        return;
      }

      // verify
      try {
        const verify = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (!verify.ok) {
          sessionStorage.removeItem('admin_token');
          router.push('/admin');
          return;
        }
        setAuthenticated(true);
      } catch (e) {
        console.error('Auth verify failed', e);
        router.push('/admin');
        return;
      }

      // fetch destination
      try {
        const res = await fetch(`/api/admin/destinations/${id}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('admin_token') || ''}`,
          },
        });
        if (!res.ok) {
          setMessage('Failed to load destination');
          return;
        }
        const data: Destination = await res.json();
        setForm(data);
      } catch (e) {
        console.error('Fetch destination failed', e);
        setMessage('Failed to load destination');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, router]);

  const handleChange = (key: keyof DestinationForm, value: unknown) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } as DestinationForm : prev));
  };

  const numberKeys: (keyof DestinationForm)[] = useMemo(() => [
    'population','density','salesTax','incomeTax','snowfall','rainfall','gasPrice','costOfLiving','sunnyDays','lgbtqScore','humiditySummer','tciScore','alwScore','ahsScore','election2016Percent','election2024Percent'
  ], []);

  const booleanKeys: (keyof DestinationForm)[] = useMemo(() => [
    'ghostGunBan','assaultWeaponBan','techHub','militaryHub','vaSupport'
  ], []);

  const selectKeys = useMemo(() => ({
    governorParty: governorPartyOptions,
    mayorParty: governorPartyOptions,
    stateParty: governorPartyOptions,
    marijuanaStatus: marijuanaOptions,
    firearmLaws: firearmOptions,
    costOfLivingLabel: colLabelOptions,
  } as Record<string, readonly string[]>), []);

  const textKeys: (keyof DestinationForm)[] = useMemo(() => [
    'id','stateCode','city','county','state','cityPoliticalLean','giffordScore','magazineLimit','veteranBenefits','climate','nearestVA','distanceToVA','description','election2016Winner','election2024Winner','electionChange'
  ], []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/destinations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('admin_token') || ''}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMessage(err.error || 'Save failed');
        return;
      }
      setMessage('Saved successfully');
    } catch (e) {
      console.error('Save failed', e);
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-primary">Loading...</div>
      </div>
    );
  }

  if (!authenticated) return null;
  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-color-muted/20">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-sm font-semibold text-primary hover:text-accent transition-colors">← Back to Dashboard</Link>
            </div>
            <ThemeToggle />
          </div>
          <div className="text-muted-foreground">Destination not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-color-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-sm font-semibold text-primary hover:text-accent transition-colors">← Back to Dashboard</Link>
            <Link href={`/${form.stateCode.toLowerCase()}/${form.city.toLowerCase().replace(/\s+/g,'-')}`} className="text-sm font-semibold text-primary hover:text-accent transition-colors">Public View</Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/admin" className="rounded-lg border border-color-border/60 px-4 py-2 text-sm font-semibold text-primary hover:bg-color-muted/30 transition-colors">Admin</Link>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-primary mb-4">Edit Destination</h1>
        {message && (
          <div className="mb-4 rounded-lg border border-color-border/60 bg-white/50 dark:bg-gray-900/50 px-4 py-3 text-sm text-primary">
            {message}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {textKeys.map((key) => (
              <div key={String(key)} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">{String(key)}</label>
                <input
                  type="text"
                  value={String(form[key] ?? '')}
                  onChange={(e) => handleChange(key, e.target.value)}
                  disabled={key === 'id'}
                  className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            ))}

            {numberKeys.map((key) => (
              <div key={String(key)} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">{String(key)}</label>
                <input
                  type="number"
                  value={Number(form[key] ?? 0)}
                  onChange={(e) => handleChange(key, e.target.value === '' ? null : Number(e.target.value))}
                  className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            ))}

            {Object.entries(selectKeys).map(([k, options]) => {
              const key = k as keyof DestinationForm;
              return (
                <div key={k} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">{k}</label>
                  <select
                    value={String(form[key] ?? '')}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full rounded-lg border border-color-border/60 bg-transparent px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    {options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              );
            })}

            {booleanKeys.map((key) => (
              <label key={String(key)} className="flex items-center gap-2 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={Boolean(form[key])}
                  onChange={(e) => handleChange(key, e.target.checked)}
                  className="h-4 w-4"
                />
                {String(key)}
              </label>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg border border-color-border/60 px-4 py-2 text-sm font-semibold text-primary hover:bg-color-muted/30 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <Link href="/admin/dashboard" className="text-sm font-semibold text-primary hover:text-accent transition-colors">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}


