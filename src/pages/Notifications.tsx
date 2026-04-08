import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Check, ExternalLink, MailOpen, RefreshCcw } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';

type Notif = {
  id: string;
  authUid: string;
  type?: string;
  message?: string;
  siteKey?: string | null;
  siteName?: string | null;
  link?: string | null;
  read?: boolean;
  createdOn?: { toDate: () => Date } | Date | string | null;
};

function createdToMillis(value: Notif['createdOn']): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string') {
    const t = new Date(value).getTime();
    return Number.isFinite(t) ? t : 0;
  }
  if (typeof (value as any).toDate === 'function') {
    try {
      return (value as any).toDate().getTime();
    } catch {
      return 0;
    }
  }
  return 0;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/signin', { replace: true });
      return;
    }
  }, [authLoading, navigate, user]);

  useEffect(() => {
    if (!user) return;

    const qNotifs = query(collection(firestore, 'notifications'), where('authUid', '==', user.uid));
    const unsub = onSnapshot(
      qNotifs,
      (snap) => {
        const list: Notif[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) } as any));
        list.sort((a, b) => createdToMillis(b.createdOn) - createdToMillis(a.createdOn));
        setItems(list.slice(0, 50));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [user]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const markRead = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(firestore, 'notifications', id), { read: true });
  };

  const markAllRead = async () => {
    if (!user || markingAll) return;
    setMarkingAll(true);
    try {
      const qUnread = query(
        collection(firestore, 'notifications'),
        where('authUid', '==', user.uid),
        where('read', '==', false)
      );
      const snap = await getDocs(qUnread);
      if (snap.empty) return;
      const batch = writeBatch(firestore);
      for (const d of snap.docs) batch.update(doc(firestore, 'notifications', d.id), { read: true });
      await batch.commit();
    } finally {
      setMarkingAll(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-brand-50 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-brand-400">Volunteer</div>
              <h1 className="mt-2 text-4xl font-serif font-bold text-brand-950 inline-flex items-center gap-3">
                <Bell className="w-7 h-7 text-brand-700" /> Notifications
              </h1>
              <p className="mt-3 text-brand-500 leading-relaxed">
                You’ll get alerts when a watched site opens up a vacancy.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/volunteer"
                className="px-5 py-3 bg-white border border-brand-100 rounded-2xl font-bold text-brand-950 hover:bg-brand-50 transition-colors"
              >
                Back to dashboard
              </Link>
              <button
                disabled={markingAll || unreadCount === 0}
                onClick={markAllRead}
                className={cn(
                  'px-5 py-3 rounded-2xl font-bold transition inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed',
                  unreadCount === 0 ? 'bg-brand-50 text-brand-400 border border-brand-100' : 'bg-brand-950 text-white hover:bg-brand-800'
                )}
              >
                <Check className="w-4 h-4" /> {markingAll ? 'Marking…' : 'Mark all read'}
              </button>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-[2.5rem] border border-brand-100 shadow-sm p-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-sm font-bold text-brand-700">
                Unread: <span className="text-brand-950">{unreadCount}</span>
              </div>
              <Link to="/sites" className="text-sm font-bold text-brand-700 hover:text-brand-950 inline-flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Browse sites
              </Link>
            </div>

            {loading ? (
              <div className="mt-6 text-sm text-brand-500">Loading notifications…</div>
            ) : items.length === 0 ? (
              <div className="mt-6 p-6 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600">
                No notifications yet. Watch a site from your volunteer dashboard to receive vacancy alerts.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {items.map((n) => {
                  const date = createdToMillis(n.createdOn);
                  const createdLabel = date ? new Date(date).toLocaleString() : '';
                  const to = n.siteKey ? `/site/${n.siteKey}` : n.link || null;

                  return (
                    <div
                      key={n.id}
                      className={cn(
                        'p-6 rounded-2xl border flex items-start justify-between gap-4',
                        n.read ? 'border-brand-100 bg-white' : 'border-brand-200 bg-brand-50'
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full',
                              n.type === 'vacancy' ? 'bg-emerald-100 text-emerald-800' : 'bg-brand-100 text-brand-700'
                            )}
                          >
                            {n.type || 'info'}
                          </div>
                          {createdLabel ? <div className="text-xs text-brand-400">{createdLabel}</div> : null}
                        </div>
                        <div className="mt-3 font-bold text-brand-950 break-words">{n.message || 'Notification'}</div>
                        {n.siteName ? <div className="mt-1 text-sm text-brand-600">Site: {n.siteName}</div> : null}
                      </div>

                      <div className="flex items-center gap-2">
                        {to ? (
                          <Link
                            to={to}
                            className="px-4 py-2 rounded-xl bg-white border border-brand-100 text-brand-950 font-bold hover:bg-brand-50 transition inline-flex items-center gap-2"
                          >
                            View <ExternalLink className="w-4 h-4" />
                          </Link>
                        ) : null}
                        {!n.read ? (
                          <button
                            onClick={() => markRead(n.id)}
                            className="px-4 py-2 rounded-xl bg-brand-950 text-white font-bold hover:bg-brand-800 transition inline-flex items-center gap-2"
                          >
                            <MailOpen className="w-4 h-4" /> Read
                          </button>
                        ) : (
                          <div className="px-4 py-2 rounded-xl bg-white border border-brand-100 text-brand-600 font-bold inline-flex items-center gap-2">
                            <RefreshCcw className="w-4 h-4" /> Read
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

