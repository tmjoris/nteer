import { useEffect, useRef } from 'react';
import { collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { useAuth } from '../lib/auth';

type WatchedSiteDoc = {
  siteId?: string;
  siteName?: string | null;
  notifyOnVacancy?: boolean;
  wasFullWhenSaved?: boolean;
};

type LocationDoc = {
  name?: string;
  capacity?: number;
  current?: number;
};

function isFullSite(site: LocationDoc | null): boolean {
  const capacity = Number(site?.capacity ?? 0);
  const current = Number(site?.current ?? 0);
  if (!Number.isFinite(capacity) || capacity <= 0) return false;
  if (!Number.isFinite(current) || current < 0) return false;
  return current >= capacity;
}

export default function NotificationWatcher() {
  const { user, profile, role } = useAuth();
  const unsubBySiteIdRef = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    // Cleanup helper
    const clearAll = () => {
      for (const [, unsub] of unsubBySiteIdRef.current) unsub();
      unsubBySiteIdRef.current.clear();
    };

    if (!user || !profile?.id || role !== 'volunteer') {
      clearAll();
      return;
    }

    const watchedRef = collection(firestore, 'user', profile.id, 'watchedSites');
    const unsubWatched = onSnapshot(watchedRef, (snap) => {
      const watchedSiteIds = new Set<string>();

      for (const d of snap.docs) {
        const data = d.data() as WatchedSiteDoc;
        const siteId = (data.siteId || d.id || '').trim();
        if (!siteId) continue;
        watchedSiteIds.add(siteId);

        if (unsubBySiteIdRef.current.has(siteId)) continue;

        const siteDocRef = doc(firestore, 'locations', siteId);
        const watchDocRef = doc(firestore, 'user', profile.id, 'watchedSites', d.id);

        const unsubSite = onSnapshot(siteDocRef, async (siteSnap) => {
          if (!siteSnap.exists()) return;

          const site = siteSnap.data() as LocationDoc;
          const nowFull = isFullSite(site);

          const ws = await getDoc(watchDocRef);
          if (!ws.exists()) return;
          const watch = (ws.data() as WatchedSiteDoc) || {};
          const wasFullWhenSaved = Boolean(watch.wasFullWhenSaved);
          const notifyOnVacancy = watch.notifyOnVacancy !== false;

          // Re-arm whenever the site becomes full again.
          if (nowFull && !wasFullWhenSaved) {
            await setDoc(
              watchDocRef,
              { wasFullWhenSaved: true, notifyOnVacancy: true, updatedOn: serverTimestamp() },
              { merge: true }
            );
            return;
          }

          // If it was full and now has a vacancy, create a notification once.
          if (!nowFull && wasFullWhenSaved && notifyOnVacancy) {
            const batch = writeBatch(firestore);
            const notifRef = doc(collection(firestore, 'notifications'));
            batch.set(notifRef, {
              authUid: user.uid,
              type: 'vacancy',
              siteKey: siteId,
              siteName: site?.name ?? watch.siteName ?? null,
              message: `${site?.name ?? watch.siteName ?? 'A watched site'} has an open volunteer slot.`,
              read: false,
              createdOn: serverTimestamp(),
            });
            batch.set(
              watchDocRef,
              { wasFullWhenSaved: false, notifyOnVacancy: false, updatedOn: serverTimestamp() },
              { merge: true }
            );
            await batch.commit();
          }
        });

        unsubBySiteIdRef.current.set(siteId, unsubSite);
      }

      // Unsubscribe from sites that are no longer watched.
      for (const [siteId, unsub] of Array.from(unsubBySiteIdRef.current.entries())) {
        if (!watchedSiteIds.has(siteId)) {
          unsub();
          unsubBySiteIdRef.current.delete(siteId);
        }
      }
    });

    return () => {
      unsubWatched();
      clearAll();
    };
  }, [profile?.id, role, user]);

  return null;
}
