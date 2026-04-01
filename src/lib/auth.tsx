import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { firebaseAuth, firestore } from './firebase';
import { normalizeRole, type Role } from './rbac';

export type UserProfile = {
  id: string;
  authUid: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  city?: string;
  userRole?: Role;
  supervisorStatus?: 'pending' | 'approved' | 'rejected';
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  role: Role | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadUserProfile(authUid: string): Promise<UserProfile | null> {
  const usersRef = collection(firestore, 'user');
  const q = query(usersRef, where('authUid', '==', authUid), limit(1));
  const snap = await getDocs(q);
  const doc = snap.docs[0];
  if (!doc) return null;
  const data = doc.data() as any;

  const userRole = normalizeRole(data?.userRole ?? null) ?? undefined;
  const supervisorStatusRaw = data?.supervisorStatus;
  const supervisorStatus =
    supervisorStatusRaw === 'pending' || supervisorStatusRaw === 'approved' || supervisorStatusRaw === 'rejected'
      ? supervisorStatusRaw
      : undefined;
  return {
    id: doc.id,
    authUid,
    email: typeof data?.email === 'string' ? data.email : undefined,
    fullName: typeof data?.fullName === 'string' ? data.fullName : undefined,
    phoneNumber: typeof data?.phoneNumber === 'string' ? data.phoneNumber : undefined,
    city: typeof data?.city === 'string' ? data.city : undefined,
    userRole,
    supervisorStatus,
  };
}

export function AuthProvider(props: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(firebaseAuth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const current = firebaseAuth.currentUser;
    if (!current) {
      setProfile(null);
      return;
    }
    const nextProfile = await loadUserProfile(current.uid);
    setProfile(nextProfile);
  };

  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      if (cancelled) return;
      setUser(nextUser);
      setProfile(null);

      if (!nextUser) {
        setLoading(false);
        return;
      }

      try {
        const nextProfile = await loadUserProfile(nextUser.uid);
        if (cancelled) return;

        // If the user doc was deleted (e.g. rejected/deleted account), treat as disabled.
        if (!nextProfile) {
          try {
            sessionStorage.setItem('auth_error', 'Your account is not active.');
          } catch {
            // ignore
          }
          await signOut(firebaseAuth);
          return;
        }

        setProfile(nextProfile);
      } finally {
        if (!cancelled) setLoading(false);
      }
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const role = profile?.userRole ?? null;
    return { user, profile, role, loading, refreshProfile };
  }, [user, profile, loading]);

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider />');
  return ctx;
}
