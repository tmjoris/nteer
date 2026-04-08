import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, Eye, EyeOff, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';
import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';

type Site = {
  id: string;
  name?: string;
  cause?: string;
  description?: string;
  capacity?: number;
  current?: number;
  location?: { lat: number; lng: number } | string;
  status?: string;
};

function isFull(site: Site): boolean {
  const cap = Number(site.capacity ?? 0);
  const cur = Number(site.current ?? 0);
  if (!Number.isFinite(cap) || cap <= 0) return false;
  if (!Number.isFinite(cur) || cur < 0) return false;
  return cur >= cap;
}

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const { user, profile, role, loading: authLoading } = useAuth();

  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [search, setSearch] = useState('');

  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [savingWatchId, setSavingWatchId] = useState<string | null>(null);

  useEffect(() => {
    // Sites list (public)
    const qSites = query(collection(firestore, 'locations'), limit(200));
    const unsub = onSnapshot(
      qSites,
      (snap) => {
        const list: Site[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        list.sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? '')));
        setSites(list);
        setLoadingSites(false);
      },
      () => setLoadingSites(false)
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !profile?.id) {
      setWatchedIds(new Set());
      return;
    }

    const watchedRef = collection(firestore, 'user', profile.id, 'watchedSites');
    const unsub = onSnapshot(watchedRef, (snap) => {
      const next = new Set<string>();
      for (const d of snap.docs) next.add(d.id);
      setWatchedIds(next);
    });
    return () => unsub();
  }, [profile?.id, user]);

  const filteredSites = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = sites.filter((s) => (s.status ? String(s.status).toLowerCase() !== 'rejected' : true));
    if (!q) return base;
    return base.filter((s) => {
      const hay = `${s.name ?? ''} ${s.cause ?? ''} ${s.description ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [search, sites]);

  const canWatch = Boolean(user && profile?.id && role === 'volunteer');

  const toggleWatch = async (site: Site) => {
    if (!user) {
      navigate('/signin');
      return;
    }
    if (!profile?.id) {
      toast.error('Profile not found. Please sign out and sign in again.');
      return;
    }
    if (role !== 'volunteer') {
      toast.error('Only volunteers can watch sites.');
      return;
    }

    setSavingWatchId(site.id);
    try {
      const watchDocRef = doc(firestore, 'user', profile.id, 'watchedSites', site.id);
      if (watchedIds.has(site.id)) {
        await deleteDoc(watchDocRef);
        toast.success('Removed from watched sites.');
      } else {
        await setDoc(watchDocRef, {
          siteId: site.id,
          siteName: site.name ?? null,
          notifyOnVacancy: true,
          wasFullWhenSaved: isFull(site),
          createdOn: serverTimestamp(),
        });
        toast.success('Site saved. You will be notified when a vacancy opens.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update watch list.');
    } finally {
      setSavingWatchId(null);
    }
  };

  const watchedSites = useMemo(() => {
    const byId = new Map(sites.map((s) => [s.id, s]));
    return Array.from(watchedIds)
      .map((id) => byId.get(id))
      .filter(Boolean) as Site[];
  }, [sites, watchedIds]);

  const availableWatched = watchedSites.filter((s) => !isFull(s));

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-brand-50 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-brand-400">Volunteer</div>
              <h1 className="mt-2 text-4xl font-serif font-bold text-brand-950">Dashboard</h1>
              <p className="mt-3 text-brand-500 leading-relaxed max-w-2xl">
                Browse sites freely. Sign in to watch a site and receive vacancy notifications.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/sites"
                className="px-5 py-3 bg-white border border-brand-100 rounded-2xl font-bold text-brand-950 hover:bg-brand-50 transition-colors"
              >
                Open Map
              </Link>
              {user ? (
                <Link
                  to="/notifications"
                  className="px-5 py-3 bg-brand-950 text-white rounded-2xl font-bold hover:bg-brand-800 transition-colors inline-flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" /> Notifications
                </Link>
              ) : (
                <Link
                  to="/signin"
                  className="px-5 py-3 bg-brand-950 text-white rounded-2xl font-bold hover:bg-brand-800 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Watched */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-1 bg-white rounded-[2.5rem] border border-brand-100 shadow-sm p-8">
              <h2 className="text-lg font-serif font-bold text-brand-950">Watched Sites</h2>
              {!user ? (
                <div className="mt-4 p-5 rounded-2xl bg-brand-50 border border-brand-100 text-sm text-brand-600">
                  Sign in as a volunteer to save/watch a site.
                </div>
              ) : authLoading ? (
                <p className="mt-4 text-sm text-brand-500">Loading…</p>
              ) : role !== 'volunteer' ? (
                <div className="mt-4 p-5 rounded-2xl bg-brand-50 border border-brand-100 text-sm text-brand-600">
                  Watching sites is available for volunteer accounts.
                </div>
              ) : watchedSites.length === 0 ? (
                <div className="mt-4 p-5 rounded-2xl bg-brand-50 border border-brand-100 text-sm text-brand-600">
                  No watched sites yet. Click “Watch” on a site to get vacancy notifications.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {availableWatched.length > 0 ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">
                      {availableWatched.length} watched site{availableWatched.length === 1 ? '' : 's'} currently have
                      vacancies.
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-semibold">
                      Your watched sites are currently full. We’ll notify you when a slot opens.
                    </div>
                  )}

                  {watchedSites.slice(0, 8).map((s) => {
                    const full = isFull(s);
                    return (
                      <Link
                        key={s.id}
                        to={`/site/${s.id}`}
                        className="block p-4 rounded-2xl bg-white border border-brand-100 hover:bg-brand-50 transition"
                      >
                        <div className="font-bold text-brand-950">{s.name ?? 'Site'}</div>
                        <div className="mt-2 text-sm text-brand-600 flex items-center justify-between">
                          <span>
                            {Number(s.current ?? 0)} / {Number(s.capacity ?? 0)}
                          </span>
                          <span className={full ? 'text-red-700 font-bold' : 'text-emerald-700 font-bold'}>
                            {full ? 'Full' : 'Available'}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                  {watchedSites.length > 8 ? (
                    <p className="text-xs text-brand-400">Showing first 8 watched sites.</p>
                  ) : null}
                </div>
              )}
            </section>

            {/* Browse */}
            <section className="lg:col-span-2 bg-white rounded-[2.5rem] border border-brand-100 shadow-sm p-8">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-serif font-bold text-brand-950">Browse Sites</h2>
                  <p className="mt-2 text-sm text-brand-500">
                    Open any site to view details and leave a review (volunteer accounts only).
                  </p>
                </div>
                <div className="w-full sm:w-80">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search sites..."
                    className="w-full p-3 bg-brand-50 border border-brand-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                  />
                </div>
              </div>

              {loadingSites ? (
                <div className="mt-6 text-sm text-brand-500">Loading sites…</div>
              ) : filteredSites.length === 0 ? (
                <div className="mt-6 p-6 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600">
                  No sites found.
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredSites.slice(0, 12).map((s) => {
                    const cap = Number(s.capacity ?? 0);
                    const cur = Number(s.current ?? 0);
                    const pct = Math.min((cur / Math.max(cap, 1)) * 100, 100);
                    const full = isFull(s);
                    const watched = watchedIds.has(s.id);

                    return (
                      <div key={s.id} className="p-6 rounded-2xl border border-brand-100 bg-white">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-brand-400">
                              {s.cause || 'Site'}
                            </div>
                            <Link to={`/site/${s.id}`} className="mt-2 block font-bold text-brand-950 hover:text-brand-700">
                              {s.name ?? 'Unnamed site'}
                            </Link>
                            <div className="mt-2 text-sm text-brand-500 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {typeof s.location === 'string'
                                ? s.location
                                : s.location && typeof s.location === 'object'
                                  ? `Lat ${(s.location as any).lat?.toFixed?.(4) ?? '—'}, Lng ${(s.location as any).lng?.toFixed?.(4) ?? '—'}`
                                  : 'Location not provided'}
                            </div>
                          </div>
                          <div
                            className={cn(
                              'py-2 px-3 rounded-xl text-xs font-bold inline-flex items-center gap-1',
                              full ? 'bg-red-500/10 text-red-700' : 'bg-emerald-500/10 text-emerald-700'
                            )}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {full ? 'Full' : 'Available'}
                          </div>
                        </div>

                        <div className="mt-5">
                          <div className="flex justify-between items-center text-sm text-brand-700">
                            <span className="inline-flex items-center gap-2">
                              <Users className="w-4 h-4" /> Volunteers
                            </span>
                            <span className="font-bold text-brand-950">
                              {cur} <span className="text-brand-400 font-normal">/ {cap}</span>
                            </span>
                          </div>
                          <div className="mt-3 w-full h-2 bg-brand-100 rounded-full overflow-hidden">
                            <div className={full ? 'h-full bg-red-500' : 'h-full bg-brand-950'} style={{ width: `${pct}%` }} />
                          </div>
                        </div>

                        <div className="mt-5 flex gap-3">
                          <Link
                            to={`/site/${s.id}`}
                            className="flex-1 py-3 rounded-2xl bg-brand-50 border border-brand-100 text-brand-950 font-bold hover:bg-brand-100 transition text-center"
                          >
                            View
                          </Link>
                          <button
                            disabled={!canWatch || savingWatchId === s.id}
                            onClick={() => toggleWatch(s)}
                            className={cn(
                              'flex-1 py-3 rounded-2xl font-bold transition inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed',
                              watched ? 'bg-white border border-brand-100 text-brand-950 hover:bg-brand-50' : 'bg-brand-950 text-white hover:bg-brand-800'
                            )}
                          >
                            {watched ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {savingWatchId === s.id ? 'Saving...' : watched ? 'Unwatch' : 'Watch'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredSites.length > 12 ? (
                <p className="mt-5 text-xs text-brand-400">Showing first 12 sites. Use search to find more.</p>
              ) : null}
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
