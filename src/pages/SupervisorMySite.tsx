import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

type RosterVolunteer = {
  id: string;
  name: string;
  email: string;
  role: string;
  registeredAt: string;
  volunteersDocId?: string;
};

type LocationPoint = { lat: number; lng: number };
type SiteDoc = {
  id: string;
  name?: string;
  cause?: string;
  description?: string;
  capacity?: number;
  current?: number;
  location?: LocationPoint | string;
  status?: 'pending' | 'approved' | 'rejected' | string;
};

type Review = {
  id: string;
  rating?: number;
  comment?: string;
  userFullName?: string;
  createdOn?: { toDate: () => Date };
};

function formatLocation(loc: SiteDoc['location']): string {
  if (!loc) return 'Not provided';
  if (typeof loc === 'string') return loc;
  const lat = typeof loc.lat === 'number' ? loc.lat : NaN;
  const lng = typeof loc.lng === 'number' ? loc.lng : NaN;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return 'Not provided';
  return `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`;
}

export default function SupervisorMySite() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [sites, setSites] = useState<SiteDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nameDraft, setNameDraft] = useState('');
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [capacityDraft, setCapacityDraft] = useState<number>(0);
  const [currentDraft, setCurrentDraft] = useState<number>(0);
  const [locationMode, setLocationMode] = useState<'coords' | 'text'>('coords');
  const [locationLatDraft, setLocationLatDraft] = useState<number>(-1.2921);
  const [locationLngDraft, setLocationLngDraft] = useState<number>(36.8219);
  const [locationTextDraft, setLocationTextDraft] = useState<string>('');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const [rosterVolunteers, setRosterVolunteers] = useState<RosterVolunteer[]>([]);
  const [isAddingVolunteer, setIsAddingVolunteer] = useState(false);
  const [newVolunteerName, setNewVolunteerName] = useState('');
  const [newVolunteerEmail, setNewVolunteerEmail] = useState('');

  const primarySite = sites[0] ?? null;
  const siteId = primarySite?.id ?? null;

  const computed = useMemo(() => {
    const capacity = Number(primarySite?.capacity ?? 0);
    const current = Number(primarySite?.current ?? 0);
    const safeCapacity = Number.isFinite(capacity) ? capacity : 0;
    const safeCurrent = Number.isFinite(current) ? current : 0;
    const pct = Math.min((safeCurrent / Math.max(safeCapacity, 1)) * 100, 100);
    const isFull = safeCapacity > 0 ? safeCurrent >= safeCapacity : false;
    return { capacity: safeCapacity, current: safeCurrent, pct, isFull };
  }, [primarySite?.capacity, primarySite?.current]);

  useEffect(() => {
    if (!siteId) {
      setRosterVolunteers([]);
      return;
    }
    const unsub = onSnapshot(collection(firestore, `locations/${siteId}/volunteers`), (snap) => {
      const vols = snap.docs.map((d) => ({ id: d.id, ...d.data() } as RosterVolunteer));
      vols.sort(
        (a, b) =>
          (b.registeredAt ? new Date(b.registeredAt).valueOf() : 0) -
          (a.registeredAt ? new Date(a.registeredAt).valueOf() : 0)
      );
      setRosterVolunteers(vols);
    });
    return () => unsub();
  }, [siteId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/signin', { replace: true });
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(firestore, 'locations'),
          where('supervisorAuthUid', '==', user.uid),
          limit(5)
        );
        const snap = await getDocs(q);
        const list: SiteDoc[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) } as any));
        setSites(list);

        const first = list[0];
        if (first) {
          setNameDraft(typeof first.name === 'string' ? first.name : '');
          setDescriptionDraft(typeof first.description === 'string' ? first.description : '');
          setCapacityDraft(Number(first.capacity ?? 0));
          setCurrentDraft(Number(first.current ?? 0));

          if (typeof first.location === 'string') {
            setLocationMode('text');
            setLocationTextDraft(first.location);
          } else if (first.location && typeof first.location === 'object') {
            const lat = Number((first.location as any).lat);
            const lng = Number((first.location as any).lng);
            setLocationMode('coords');
            if (Number.isFinite(lat)) setLocationLatDraft(lat);
            if (Number.isFinite(lng)) setLocationLngDraft(lng);
            setLocationTextDraft('');
          } else {
            setLocationMode('coords');
            setLocationTextDraft('');
          }
        } else {
          setNameDraft('');
          setDescriptionDraft('');
          setCapacityDraft(0);
          setCurrentDraft(0);
          setLocationMode('coords');
          setLocationTextDraft('');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load your site.');
        setSites([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authLoading, navigate, user]);

  const loadReviews = async () => {
    if (!siteId) return;
    setLoadingReviews(true);
    try {
      const q = query(collection(firestore, 'reviews'), where('siteKey', '==', siteId));
      const snap = await getDocs(q);
      const list: Review[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      list.sort((a, b) => {
        const ta = a.createdOn?.toDate ? a.createdOn.toDate().getTime() : 0;
        const tb = b.createdOn?.toDate ? b.createdOn.toDate().getTime() : 0;
        return tb - ta;
      });
      setReviews(list);
    } catch (err) {
      console.error(err);
      setReviews([]);
      toast.error('Could not load reviews.');
    } finally {
      setLoadingReviews(false);
    }
  };

  const toggleReviews = async () => {
    const next = !showReviews;
    setShowReviews(next);
    if (next && siteId && reviews.length === 0) {
      await loadReviews();
    }
  };

  const handleAddVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primarySite?.id || !newVolunteerName.trim() || !newVolunteerEmail.trim()) return;
    if (rosterVolunteers.length >= computed.capacity) {
      toast.error('Roster is at capacity.');
      return;
    }

    const emailNorm = normalizeEmail(newVolunteerEmail);

    try {
      const dupQ = query(
        collection(firestore, 'volunteers'),
        where('siteId', '==', primarySite.id),
        where('email', '==', emailNorm)
      );
      const dupSnap = await getDocs(dupQ);
      if (!dupSnap.empty) {
        toast.error('This email is already registered for this site.');
        return;
      }

      const siteLabel = typeof primarySite.name === 'string' ? primarySite.name : '';
      const volRef = await addDoc(collection(firestore, 'volunteers'), {
        name: newVolunteerName.trim(),
        email: emailNorm,
        siteId: primarySite.id,
        site: siteLabel,
        siteName: siteLabel,
        registeredAt: serverTimestamp(),
      });

      await addDoc(collection(firestore, `locations/${primarySite.id}/volunteers`), {
        name: newVolunteerName.trim(),
        email: newVolunteerEmail.trim(),
        emailNormalized: emailNorm,
        role: 'Registered Volunteer',
        registeredAt: new Date().toISOString(),
        volunteersDocId: volRef.id,
      });

      setNewVolunteerName('');
      setNewVolunteerEmail('');
      setIsAddingVolunteer(false);
      toast.success('Volunteer added. They can review this site after signing in with this email.');
    } catch (err) {
      console.error(err);
      toast.error('Could not add volunteer.');
    }
  };

  const handleRemoveRosterVolunteer = async (id: string, silent?: boolean) => {
    if (!primarySite?.id) return;
    const vol = rosterVolunteers.find((v) => v.id === id);
    try {
      const subRef = doc(firestore, `locations/${primarySite.id}/volunteers`, id);
      const subSnap = await getDoc(subRef);
      const volunteersDocId = subSnap.data()?.volunteersDocId as string | undefined;
      const emailNorm = vol?.email ? normalizeEmail(vol.email) : undefined;

      if (volunteersDocId) {
        await deleteDoc(doc(firestore, 'volunteers', volunteersDocId));
      } else if (emailNorm) {
        const q = query(
          collection(firestore, 'volunteers'),
          where('siteId', '==', primarySite.id),
          where('email', '==', emailNorm)
        );
        const snap = await getDocs(q);
        for (const d of snap.docs) await deleteDoc(d.ref);
      }

      await deleteDoc(subRef);
      if (!silent) toast.success('Volunteer removed.');
    } catch (err) {
      console.error(err);
      if (!silent) toast.error('Could not remove volunteer.');
    }
  };

  const clearAllRosterVolunteers = async () => {
    if (!primarySite?.id || rosterVolunteers.length === 0) return;
    if (!window.confirm('Remove all volunteers from the roster?')) return;
    const copy = [...rosterVolunteers];
    for (const v of copy) {
      await handleRemoveRosterVolunteer(v.id, true);
    }
    toast.success('Roster cleared.');
  };

  const saveSite = async () => {
    if (!primarySite?.id) return;
    const nextName = nameDraft.trim();
    const nextDescription = descriptionDraft.trim();
    const nextCapacity = Math.floor(Number(capacityDraft));
    const nextCurrent = Math.floor(Number(currentDraft));

    if (!nextName) {
      toast.error('Site name is required.');
      return;
    }
    if (!Number.isFinite(nextCapacity) || nextCapacity < 1) {
      toast.error('Max volunteer limit must be 1 or more.');
      return;
    }
    if (!Number.isFinite(nextCurrent) || nextCurrent < 0) {
      toast.error('Current volunteer count must be 0 or more.');
      return;
    }
    if (nextCurrent > nextCapacity) {
      toast.error('Current volunteers cannot exceed the max limit.');
      return;
    }

    let nextLocation: SiteDoc['location'] = primarySite.location;
    if (locationMode === 'text') {
      const t = locationTextDraft.trim();
      if (!t) {
        toast.error('Location is required.');
        return;
      }
      nextLocation = t;
    } else {
      const lat = Number(locationLatDraft);
      const lng = Number(locationLngDraft);
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        toast.error('Latitude must be between -90 and 90.');
        return;
      }
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        toast.error('Longitude must be between -180 and 180.');
        return;
      }
      nextLocation = { lat, lng };
    }

    setSaving(true);
    try {
      await updateDoc(doc(firestore, 'locations', primarySite.id), {
        name: nextName,
        description: nextDescription,
        location: nextLocation,
        capacity: nextCapacity,
        current: nextCurrent,
      });
      setSites((prev) =>
        prev.map((s) =>
          s.id === primarySite.id
            ? {
                ...s,
                name: nextName,
                description: nextDescription,
                location: nextLocation,
                capacity: nextCapacity,
                current: nextCurrent,
              }
            : s
        )
      );
      toast.success('Site updated.');
    } catch (err) {
      console.error(err);
      toast.error('Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
        <div className="text-brand-500 font-bold animate-pulse">Loading My Site...</div>
      </div>
    );
  }

  if (!user) return null;

  if (!primarySite) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-brand-50 pt-32 pb-20 px-6">
          <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] border border-brand-100 shadow-sm p-10">
            <div className="text-xs font-bold uppercase tracking-widest text-brand-400">My Site</div>
            <h1 className="mt-3 text-3xl font-serif font-bold text-brand-950">No site registered yet</h1>
            <p className="mt-4 text-brand-500 leading-relaxed">
              You can manage only one site. Register your site to start receiving volunteers.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/registersite')}
                className="px-6 py-3 bg-brand-950 text-white rounded-2xl font-bold hover:bg-brand-800 transition-colors"
              >
                Register My Site
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-brand-50 border border-brand-100 text-brand-950 rounded-2xl font-bold hover:bg-brand-100 transition-colors"
              >
                Back Home
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-brand-50 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-brand-400">Supervisor</div>
              <h1 className="mt-2 text-4xl font-serif font-bold text-brand-950">My Site</h1>
              <p className="mt-3 text-brand-500 leading-relaxed max-w-2xl">
                View and manage your registered site. Only one site is allowed per supervisor.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/site/${primarySite.id}`}
                className="px-5 py-3 bg-white border border-brand-100 rounded-2xl font-bold text-brand-950 hover:bg-brand-50 transition-colors"
              >
                View Public Page
              </Link>
            </div>
          </div>

          {sites.length > 1 ? (
            <div className="mt-6 p-5 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900">
              Multiple site records found for your account. Nteer supports only one site per supervisor; showing the
              first one.
            </div>
          ) : null}

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Site details */}
            <section className="lg:col-span-2 bg-white rounded-[2.5rem] border border-brand-100 shadow-sm p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-brand-400">Site</div>
                  <h2 className="mt-2 text-3xl font-serif font-bold text-brand-950">
                    {primarySite.name || 'Unnamed Site'}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-brand-600">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {formatLocation(primarySite.location)}
                    </span>
                    {primarySite.cause ? (
                      <span className="px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700">
                        {primarySite.cause}
                      </span>
                    ) : null}
                    {primarySite.status ? (
                      <span className="px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700">
                        Status: {String(primarySite.status)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div
                  className={cn(
                    'py-3 px-5 rounded-2xl text-sm font-bold inline-flex items-center gap-2 h-fit',
                    computed.isFull ? 'bg-red-500/10 text-red-700' : 'bg-emerald-500/10 text-emerald-700'
                  )}
                >
                  {computed.isFull ? (
                    <>
                      <AlertCircle className="w-4 h-4" /> Full
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Available
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-brand-50 border border-brand-100">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-brand-800 inline-flex items-center gap-2">
                      <Users className="w-4 h-4" /> Volunteers
                    </div>
                    <div className="text-2xl font-bold text-brand-950">
                      {computed.current}{' '}
                      <span className="text-base font-normal text-brand-500">/ {computed.capacity}</span>
                    </div>
                  </div>
                  <div className="mt-4 w-full h-3 bg-brand-100 rounded-full overflow-hidden">
                    <div
                      className={computed.isFull ? 'h-full bg-red-500' : 'h-full bg-brand-950'}
                      style={{ width: `${computed.pct}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-brand-600">
                    {computed.isFull ? 'Your site is currently full.' : 'Your site is accepting volunteers.'}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-brand-100">
                  <div className="text-sm font-bold text-brand-800">Edit site</div>
                  <div className="mt-4 space-y-4">
                    <label className="block">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-2">
                        Site Name
                      </div>
                      <input
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        className="w-full p-3 bg-brand-50 border border-brand-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                        placeholder="e.g., Happy Life Children's Home"
                      />
                    </label>

                    <label className="block">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-2">
                        Description
                      </div>
                      <textarea
                        value={descriptionDraft}
                        onChange={(e) => setDescriptionDraft(e.target.value)}
                        rows={4}
                        className="w-full p-3 bg-brand-50 border border-brand-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-950/10 resize-none"
                        placeholder="Describe your site and what volunteers will do..."
                      />
                    </label>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-2">
                        Location
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setLocationMode('coords')}
                          className={cn(
                            'py-2.5 rounded-2xl border font-bold text-sm',
                            locationMode === 'coords'
                              ? 'bg-brand-950 text-white border-brand-950'
                              : 'bg-white text-brand-900 border-brand-100 hover:bg-brand-50'
                          )}
                        >
                          Coordinates
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocationMode('text')}
                          className={cn(
                            'py-2.5 rounded-2xl border font-bold text-sm',
                            locationMode === 'text'
                              ? 'bg-brand-950 text-white border-brand-950'
                              : 'bg-white text-brand-900 border-brand-100 hover:bg-brand-50'
                          )}
                        >
                          Text
                        </button>
                      </div>

                      {locationMode === 'coords' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <label className="block">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-2">
                              Latitude
                            </div>
                            <input
                              type="number"
                              step="0.000001"
                              value={locationLatDraft}
                              onChange={(e) => setLocationLatDraft(Number(e.target.value))}
                              className="w-full p-3 bg-brand-50 border border-brand-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                            />
                          </label>
                          <label className="block">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-2">
                              Longitude
                            </div>
                            <input
                              type="number"
                              step="0.000001"
                              value={locationLngDraft}
                              onChange={(e) => setLocationLngDraft(Number(e.target.value))}
                              className="w-full p-3 bg-brand-50 border border-brand-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                            />
                          </label>
                        </div>
                      ) : (
                        <input
                          value={locationTextDraft}
                          onChange={(e) => setLocationTextDraft(e.target.value)}
                          className="w-full p-3 bg-brand-50 border border-brand-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                          placeholder="e.g., Utawala, Nairobi"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-2">
                        Current Volunteers
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={Math.max(0, capacityDraft)}
                        value={currentDraft}
                        onChange={(e) => setCurrentDraft(Number(e.target.value))}
                        className="w-full p-3 bg-brand-50 border border-brand-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                      />
                    </label>
                    <label className="block">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-2">
                        Max Volunteer Limit
                      </div>
                      <input
                        type="number"
                        min={1}
                        value={capacityDraft}
                        onChange={(e) => setCapacityDraft(Number(e.target.value))}
                        className="w-full p-3 bg-brand-50 border border-brand-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                      />
                    </label>
                  </div>
                  </div>
                  <button
                    disabled={saving}
                    onClick={saveSite}
                    className="mt-5 w-full py-4 bg-brand-950 text-white rounded-2xl font-bold hover:bg-brand-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Update Site'}
                  </button>
                </div>
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-brand-50 border border-brand-100">
                <div className="text-sm font-bold text-brand-800 mb-2">Tip</div>
                <p className="text-brand-600 leading-relaxed">
                  Use precise coordinates if you want volunteers to find your exact location on a map.
                </p>
              </div>
            </section>

            {/* Reviews */}
            <aside className="bg-white rounded-[2.5rem] border border-brand-100 shadow-sm p-8">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-serif font-bold text-brand-950 inline-flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-600" /> Feedback
                </h3>
                <button
                  type="button"
                  onClick={toggleReviews}
                  className="text-sm font-bold text-brand-700 hover:text-brand-950"
                >
                  {showReviews ? 'Hide' : 'View'}
                </button>
              </div>

              {!showReviews ? (
                <p className="mt-4 text-sm text-brand-500 leading-relaxed">
                  Reviews are written by volunteers. You can use them to improve your site experience.
                </p>
              ) : loadingReviews ? (
                <p className="mt-4 text-sm text-brand-500">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="mt-4 text-sm text-brand-500">No reviews yet.</p>
              ) : (
                <div className="mt-5 space-y-4">
                  {reviews.slice(0, 6).map((r) => (
                    <div key={r.id} className="p-4 rounded-2xl bg-brand-50 border border-brand-100">
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-bold text-brand-950 text-sm">{r.userFullName ?? 'Volunteer'}</div>
                        <div className="text-xs text-brand-400">
                          {r.createdOn?.toDate ? r.createdOn.toDate().toLocaleDateString() : ''}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-brand-500">
                        Rating: {Number(r.rating ?? 0).toFixed(1)} / 5
                      </div>
                      {r.comment ? <p className="mt-2 text-sm text-brand-700">{r.comment}</p> : null}
                    </div>
                  ))}
                  {reviews.length > 6 ? <p className="text-xs text-brand-400">Showing latest 6 reviews.</p> : null}
                </div>
              )}
            </aside>
          </div>

          {/* Volunteer roster — synced to Firestore `volunteers` for review eligibility */}
          <section className="mt-8 bg-white rounded-[2.5rem] border border-brand-100 shadow-sm p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-brand-400">Reviews access</div>
                <h3 className="mt-2 text-2xl font-serif font-bold text-brand-950">Volunteer roster</h3>
                <p className="mt-2 text-brand-500 leading-relaxed max-w-2xl">
                  Add volunteers by name and email. When they sign in with the same email as a volunteer account, they
                  can post reviews on your public site page.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingVolunteer(true)}
                  disabled={rosterVolunteers.length >= computed.capacity}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-brand-950 text-white rounded-2xl text-sm font-bold hover:bg-brand-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" /> Add volunteer
                </button>
                <button
                  type="button"
                  onClick={clearAllRosterVolunteers}
                  disabled={rosterVolunteers.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-brand-50 border border-brand-100 text-brand-950 rounded-2xl text-sm font-bold hover:bg-brand-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" /> Clear all
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-brand-600">
              <span>
                Roster: <strong>{rosterVolunteers.length}</strong> / {computed.capacity}
              </span>
              {rosterVolunteers.length >= computed.capacity ? (
                <span className="text-amber-700 font-bold">Roster full</span>
              ) : null}
            </div>

            <div className="mt-6 space-y-3">
              {rosterVolunteers.length === 0 ? (
                <div className="p-10 rounded-2xl border border-dashed border-brand-200 text-center text-brand-400">
                  No volunteers added yet.
                </div>
              ) : (
                rosterVolunteers.map((v) => (
                  <div
                    key={v.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-brand-100 bg-brand-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-600 font-bold text-lg border border-brand-100">
                        {v.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-brand-950">{v.name}</div>
                        <div className="text-sm text-brand-600">{v.email}</div>
                        <div className="text-xs text-brand-400 mt-1 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {v.registeredAt ? new Date(v.registeredAt).toLocaleDateString() : '—'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRosterVolunteer(v.id)}
                      className="self-start sm:self-center px-4 py-2 rounded-xl text-sm font-bold bg-white border border-brand-100 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {isAddingVolunteer ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <button
                type="button"
                aria-label="Close"
                className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm"
                onClick={() => setIsAddingVolunteer(false)}
              />
              <div className="relative bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border border-brand-100">
                <h2 className="text-2xl font-serif font-bold mb-6 text-brand-950">Register volunteer</h2>
                <form onSubmit={handleAddVolunteer} className="space-y-6">
                  <label className="block">
                    <span className="block text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">Full name</span>
                    <input
                      required
                      value={newVolunteerName}
                      onChange={(e) => setNewVolunteerName(e.target.value)}
                      className="w-full p-4 bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-950/10 text-brand-950 font-medium"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">Email</span>
                    <input
                      type="email"
                      required
                      value={newVolunteerEmail}
                      onChange={(e) => setNewVolunteerEmail(e.target.value)}
                      className="w-full p-4 bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-950/10 text-brand-950 font-medium"
                    />
                  </label>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingVolunteer(false)}
                      className="flex-1 py-4 bg-brand-50 rounded-xl font-bold text-brand-600 hover:bg-brand-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-brand-950 text-white rounded-xl font-bold hover:bg-brand-800 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <Footer />
    </>
  );
}
