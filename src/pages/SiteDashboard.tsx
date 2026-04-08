import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Star, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { firebaseAuth, firestore } from '../lib/firebase';
import { type User, onAuthStateChanged } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

type Review = {
  id: string;
  rating: number;
  comment: string;
  userUid: string;
  userFullName?: string;
  createdOn?: { toDate: () => Date };
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Resolve map coords from Firestore location (object or GeoPoint-like). */
function coordsFromSiteData(data: Record<string, unknown> | null): google.maps.LatLngLiteral | null {
  if (!data) return null;
  const loc = data.location as Record<string, unknown> | undefined;
  if (!loc || typeof loc !== 'object') return null;
  const lat = loc.lat ?? loc.latitude;
  const lng = loc.lng ?? loc.longitude;
  if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng };
  return null;
}

export default function SiteDashboard() {
  const { siteKey } = useParams<{ siteKey: string }>();
  const [user, setUser] = useState<User | null>(firebaseAuth.currentUser);
  const [siteData, setSiteData] = useState<Record<string, unknown> | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [canAddReview, setCanAddReview] = useState(false);
  const [userProfile, setUserProfile] = useState<{ fullName?: string; userRole?: string } | null>(null);

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const mapCoords = useMemo(() => coordsFromSiteData(siteData), [siteData]);
  const mapCenter = mapCoords ?? { lat: -1.2921, lng: 36.8219 };
  const mapZoom = mapCoords ? 12 : 10;

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!siteKey) return;

    const load = async () => {
      // Load site details (Firestore-first)
      try {
        const snap = await getDoc(doc(firestore, 'locations', siteKey));
        if (snap.exists()) setSiteData(snap.data() as Record<string, unknown>);
      } catch {
        // ignore
      }

      // Load reviews
      try {
        const q = query(collection(firestore, 'reviews'), where('siteKey', '==', siteKey));
        const snap = await getDocs(q);
        const list: Review[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        list.sort((a, b) => {
          const ta = a.createdOn ? a.createdOn.toDate().getTime() : 0;
          const tb = b.createdOn ? b.createdOn.toDate().getTime() : 0;
          return tb - ta;
        });
        setReviews(list);
      } catch {
        setReviews([]);
      }
    };

    load();
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey || !user) {
      setCanAddReview(false);
      setUserProfile(null);
      return;
    }

    const checkEligibility = async () => {
      // 1) Load user profile
      const usersQ = query(collection(firestore, 'user'), where('authUid', '==', user.uid), limit(1));
      const usersSnap = await getDocs(usersQ);
      const profileDoc = usersSnap.docs[0];
      const profile = (profileDoc?.data() ?? {}) as Record<string, unknown>;
      const fullName = typeof profile.fullName === 'string' ? profile.fullName : undefined;
      const userRole = typeof profile.userRole === 'string' ? profile.userRole.toLowerCase() : undefined;
      setUserProfile({ fullName, userRole: profile.userRole as string | undefined });

      if (userRole !== 'volunteer') {
        setCanAddReview(false);
        return;
      }

      // 2) Supervisor-registered roster: top-level `volunteers` collection (email + siteId).
      const authEmail = user.email ? normalizeEmail(user.email) : '';
      if (!authEmail) {
        setCanAddReview(false);
        return;
      }

      try {
        const rosterQ = query(
          collection(firestore, 'volunteers'),
          where('email', '==', authEmail),
          where('siteId', '==', siteKey),
          limit(1)
        );
        const rosterSnap = await getDocs(rosterQ);
        if (!rosterSnap.empty) {
          setCanAddReview(true);
          return;
        }
      } catch {
        // fall through to legacy checks
      }

      // 3) Legacy: user doc arrays or siteVolunteers membership
      const arrays = [
        profile.currentVolunteerSites,
        profile.formerVolunteerSites,
        profile.currentSites,
        profile.formerSites,
      ];

      const hasArrayMatch = arrays.some((arr) => Array.isArray(arr) && arr.includes(siteKey));
      if (hasArrayMatch) {
        setCanAddReview(true);
        return;
      }

      try {
        const membershipQ = query(
          collection(firestore, 'siteVolunteers'),
          where('authUid', '==', user.uid),
          where('siteKey', '==', siteKey),
          limit(1)
        );
        const membershipSnap = await getDocs(membershipQ);
        const membership = membershipSnap.docs[0]?.data() as { status?: string } | undefined;
        const status = membership?.status;
        setCanAddReview(status === 'current' || status === 'former');
      } catch {
        setCanAddReview(false);
      }
    };

    checkEligibility().catch(() => setCanAddReview(false));
  }, [siteKey, user]);

  const siteName = (siteData?.name as string | undefined) || 'Site';
  const siteDescription =
    (siteData?.description as string | undefined) ||
    (siteData?.siteDescription as string | undefined) ||
    '';

  const refreshReviews = async () => {
    if (!siteKey) return;
    const q = query(collection(firestore, 'reviews'), where('siteKey', '==', siteKey));
    const snap = await getDocs(q);
    const list: Review[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    list.sort((a, b) => {
      const ta = a.createdOn ? a.createdOn.toDate().getTime() : 0;
      const tb = b.createdOn ? b.createdOn.toDate().getTime() : 0;
      return tb - ta;
    });
    setReviews(list);
  };

  const handleAddReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!siteKey || !user || !canAddReview) return;
    if (!comment.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(firestore, 'reviews'), {
        siteKey,
        rating,
        comment: comment.trim(),
        userUid: user.uid,
        userFullName: userProfile?.fullName ?? user.email ?? 'Volunteer',
        createdOn: serverTimestamp(),
      });
      setComment('');
      setRating(5);
      await refreshReviews();
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value: number) => {
    const v = Math.round(value);
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= v;
          return <Star key={i} className={filled ? 'w-4 h-4 text-yellow-500 fill-yellow-500' : 'w-4 h-4 text-brand-300'} />;
        })}
      </div>
    );
  };

  return (
      <>
      <Navbar />
      <div className="min-h-screen bg-brand-50 pt-10 pb-20 px-6">

      <div className="max-w-6xl mx-auto pt-20">
        {/* Map + single pin */}
        <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-200 bg-white">
          <APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY}>
            <div className="relative h-[360px]">
              <Map
                style={{ width: '100%', height: '100%' }}
                center={mapCenter}
                defaultZoom={mapZoom}
                mapId="DEMO_MAP_ID"
              >
                {mapCoords && (
                  <AdvancedMarker position={mapCoords}>
                    <div className="relative flex h-6 w-6">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-6 w-6 shadow-lg bg-blue-700 shadow-blue-500/50" />
                    </div>
                  </AdvancedMarker>
                )}
              </Map>
            </div>
          </APIProvider>
        </div>

        {/* Site content */}
        <div className="mt-8 bg-white p-8 rounded-[2.5rem] border border-brand-100 shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-brand-950">{siteName}</h1>
              {siteDescription ? (
                <p className="mt-3 text-brand-500 leading-relaxed">{siteDescription}</p>
              ) : (
                <p className="mt-3 text-brand-300 leading-relaxed">No description available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-8 bg-white p-8 rounded-[2.5rem] border border-brand-100 shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-brand-950">Reviews</h2>
              <p className="text-sm text-brand-400 mt-1">From previous volunteers</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {reviews.length === 0 ? (
              <div className="p-6 rounded-2xl border border-brand-100 bg-brand-50 text-brand-400">
                No reviews yet.
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="p-6 rounded-2xl border border-brand-100 bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-brand-950">{r.userFullName ?? 'Volunteer'}</div>
                      <div className="mt-2">{renderStars(r.rating)}</div>
                    </div>
                    <div className="text-xs text-brand-400">
                      {r.createdOn?.toDate ? r.createdOn.toDate().toLocaleDateString() : ''}
                    </div>
                  </div>
                  <p className="mt-4 text-brand-500 leading-relaxed">{r.comment}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-brand-50">
            {!user ? (
              <div className="p-6 rounded-2xl border border-brand-100 bg-brand-50 text-brand-400">
                Sign in as a volunteer to add a review.
              </div>
            ) : !canAddReview ? (
              <div className="p-6 rounded-2xl border border-brand-100 bg-brand-50 text-brand-400">
                Only current/former volunteers at this site can add a review.
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">Rating</div>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-brand-50 border border-brand-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} Stars
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="p-6 rounded-2xl border border-brand-100 bg-white">
                    <div className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">Preview</div>
                    {renderStars(rating)}
                  </div>
                </div>

                <label className="block">
                  <div className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">Your Review</div>
                  <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-brand-50 border border-brand-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-950/10 resize-none"
                    placeholder="Share your experience at this site..."
                  />
                </label>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 bg-brand-950 text-white rounded-2xl font-bold hover:bg-brand-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Adding...' : 'Add Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}

