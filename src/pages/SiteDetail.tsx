import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Send, Star, Users } from 'lucide-react';
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

export default function SiteDetail() {
  const { siteKey } = useParams<{ siteKey: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(firebaseAuth.currentUser);

  const [siteData, setSiteData] = useState<any | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canAddReview, setCanAddReview] = useState(false);
  const [userProfile, setUserProfile] = useState<{ fullName?: string; userRole?: string } | null>(null);

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!siteKey) return;

    const load = async () => {
      // Firestore-first
      try {
        const snap = await getDoc(doc(firestore, 'locations', siteKey));
        if (snap.exists()) setSiteData(snap.data());
        else setSiteData(null);
      } catch {
        setSiteData(null);
      }

      // Reviews
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
        setCanAddReview(!rosterSnap.empty);
      } catch {
        setCanAddReview(false);
      }
    };

    checkEligibility().catch(() => setCanAddReview(false));
  }, [siteKey, user]);

  const siteName = (siteData?.name as string | undefined) || 'Site';
  const siteCause = (siteData?.cause as string | undefined) || '';
  const siteDescription =
    (siteData?.description as string | undefined) ||
    (siteData?.siteDescription as string | undefined) ||
    '';

  const capacity = Number(siteData?.capacity ?? 0);
  const current = Number(siteData?.current ?? 0);
  const pct = Math.min((current / Math.max(capacity, 1)) * 100, 100);
  const isFull = capacity > 0 ? current >= capacity : false;

  const locationLabel = (() => {
    const loc = siteData?.location;
    if (!loc) return 'Not provided';
    if (typeof loc === 'string') return loc;
    const lat = typeof loc.lat === 'number' ? loc.lat : NaN;
    const lng = typeof loc.lng === 'number' ? loc.lng : NaN;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return 'Not provided';
    return `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`;
  })();

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
          return (
            <Star
              key={i}
              className={filled ? 'w-4 h-4 text-yellow-500 fill-yellow-500' : 'w-4 h-4 text-brand-300'}
            />
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-brand-50 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-800 font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <Link to="/sites" className="text-sm font-bold text-brand-700 hover:text-brand-950">
              Browse sites
            </Link>
          </div>

          <div className="mt-6 bg-white rounded-[2.5rem] border border-brand-100 shadow-sm p-8">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-brand-400">Site</div>
                <h1 className="mt-2 text-3xl font-serif font-bold text-brand-950">{siteName}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-brand-600">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {locationLabel}
                  </span>
                  {siteCause ? (
                    <span className="px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700">
                      {siteCause}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-brand-50 border border-brand-100 min-w-[280px]">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-brand-800 inline-flex items-center gap-2">
                    <Users className="w-4 h-4" /> Volunteers
                  </span>
                  <span className="text-2xl font-bold text-brand-950">
                    {current} <span className="text-base font-normal text-brand-500">/ {capacity}</span>
                  </span>
                </div>
                <div className="w-full h-3 bg-brand-100 rounded-full overflow-hidden">
                  <div className={`h-full ${isFull ? 'bg-red-500' : 'bg-brand-600'}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-3 text-sm font-medium text-brand-700">
                  {isFull ? 'This site is currently full.' : 'Slots still available.'}
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-brand-50 border border-brand-100">
              <div className="text-sm font-bold text-brand-800 mb-2">About</div>
              <p className="text-brand-600 leading-relaxed">
                {siteDescription?.trim() ? siteDescription : 'No description available.'}
              </p>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-[2.5rem] border border-brand-100 shadow-sm p-8">
            <div className="flex items-start justify-between gap-6 flex-wrap">
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
                  Only volunteers registered for this site (same email as on the supervisor roster) can add a review.
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
