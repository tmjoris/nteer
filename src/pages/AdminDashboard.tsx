import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, RefreshCcw, Users, LogOut, CheckCircle2, XCircle, UserRound } from 'lucide-react';
import {
  collection,
  deleteDoc,
  doc as fsDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import Footer from '../components/Footer';
import { firebaseAuth, firestore } from '../lib/firebase';
import { normalizeRole, type Role } from '../lib/rbac';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

type UserRow = {
  id: string;
  authUid?: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  city?: string;
  userRole?: Role;
  supervisorStatus?: 'pending' | 'approved' | 'rejected';
};

type SiteRow = {
  id: string;
  name?: string;
  location?: string;
  cause?: string;
  description?: string;
  capacity?: number;
  supervisorName?: string;
  email?: string;
  phone?: string;
  supervisorAuthUid?: string;
  status?: 'pending' | 'approved' | 'rejected';
};

const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'supervisor', label: 'Site Supervisor' },
  { value: 'admin', label: 'Admin' },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSites, setLoadingSites] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingSiteId, setSavingSiteId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [active, setActive] = useState<'submissions' | 'roles'>('submissions');
  const [supervisorTab, setSupervisorTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [siteTab, setSiteTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [showProfile, setShowProfile] = useState(false);
  const [confirm, setConfirm] = useState<
    | null
    | {
        title: string;
        description?: string;
        confirmText: string;
        danger?: boolean;
        action:
          | { kind: 'delete_user'; user: UserRow }
          | { kind: 'reject_supervisor'; user: UserRow }
          | { kind: 'reject_site'; site: SiteRow }
          | { kind: 'reject_submission_delete_user'; site: SiteRow };
      }
  >(null);
  const navigate = useNavigate();
  const { profile } = useAuth();

  const closeConfirm = () => setConfirm(null);

  const openConfirm = (next: NonNullable<typeof confirm>) => setConfirm(next);

  const runConfirmAction = async () => {
    if (!confirm) return;
    const action = confirm.action;
    closeConfirm();

    switch (action.kind) {
      case 'delete_user':
        await deleteUserByAdmin(action.user);
        return;
      case 'reject_supervisor':
        await rejectSupervisorAndDelete(action.user);
        return;
      case 'reject_site':
        await rejectSiteOnly(action.site);
        return;
      case 'reject_submission_delete_user':
        await rejectSubmissionAndDeleteUser(action.site);
        return;
    }
  };

  const loadUsers = async () => {
    setError('');
    setLoading(true);
    try {
      const snap = await getDocs(collection(firestore, 'user'));
      const next: UserRow[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          authUid: typeof data?.authUid === 'string' ? data.authUid : undefined,
          email: typeof data?.email === 'string' ? data.email : undefined,
          fullName: typeof data?.fullName === 'string' ? data.fullName : undefined,
          phoneNumber: typeof data?.phoneNumber === 'string' ? data.phoneNumber : undefined,
          city: typeof data?.city === 'string' ? data.city : undefined,
          userRole: normalizeRole(data?.userRole) ?? undefined,
          supervisorStatus:
            data?.supervisorStatus === 'pending' || data?.supervisorStatus === 'approved' || data?.supervisorStatus === 'rejected'
              ? data.supervisorStatus
              : undefined,
        };
      });
      next.sort((a, b) => (a.fullName ?? a.email ?? '').localeCompare(b.fullName ?? b.email ?? ''));
      setUsers(next);
    } catch (e) {
      setError('Failed to load users. Check Firestore rules and connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const loadSites = async () => {
    setError('');
    setLoadingSites(true);
    try {
      const sitesRef = collection(firestore, 'locations');
      const q = query(sitesRef, orderBy('createdOn', 'desc'));
      const snap = await getDocs(q);
      const next: SiteRow[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: typeof data?.name === 'string' ? data.name : undefined,
          location: typeof data?.location === 'string' ? data.location : undefined,
          cause: typeof data?.cause === 'string' ? data.cause : undefined,
          description: typeof data?.description === 'string' ? data.description : undefined,
          capacity: typeof data?.capacity === 'number' ? data.capacity : undefined,
          supervisorName: typeof data?.supervisorName === 'string' ? data.supervisorName : undefined,
          email: typeof data?.email === 'string' ? data.email : undefined,
          phone: typeof data?.phone === 'string' ? data.phone : undefined,
          supervisorAuthUid: typeof data?.supervisorAuthUid === 'string' ? data.supervisorAuthUid : undefined,
          status:
            data?.status === 'pending' || data?.status === 'approved' || data?.status === 'rejected'
              ? data.status
              : undefined,
        };
      });
      setSites(next);
    } catch (e) {
      setError('Failed to load sites. Check Firestore rules.');
    } finally {
      setLoadingSites(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadSites();
  }, []);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { admin: 0, supervisor: 0, volunteer: 0, unknown: 0 };
    for (const u of users) {
      if (!u.userRole) counts.unknown += 1;
      else counts[u.userRole] += 1;
    }
    return counts;
  }, [users]);

  const updateRole = async (userId: string, nextRole: Role) => {
    setSavingId(userId);
    setError('');
    try {
      const patch: any = { userRole: nextRole };
      if (nextRole === 'supervisor') patch.supervisorStatus = 'pending';
      if (nextRole !== 'supervisor') patch.supervisorStatus = 'approved';

      await updateDoc(fsDoc(firestore, 'user', userId), patch);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, userRole: nextRole, supervisorStatus: patch.supervisorStatus }
            : u
        )
      );
    } catch (e) {
      setError('Failed to update role. Check Firestore rules.');
    } finally {
      setSavingId(null);
    }
  };

  const setSupervisorStatus = async (userId: string, status: 'approved' | 'rejected') => {
    setSavingId(userId);
    setError('');
    try {
      await updateDoc(fsDoc(firestore, 'user', userId), { supervisorStatus: status });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, supervisorStatus: status } : u)));
    } catch (e) {
      setError('Failed to update supervisor status. Check Firestore rules.');
    } finally {
      setSavingId(null);
    }
  };

  const setSiteStatus = async (siteId: string, status: 'approved' | 'rejected') => {
    setSavingSiteId(siteId);
    setError('');
    try {
      await updateDoc(fsDoc(firestore, 'locations', siteId), { status });
      setSites((prev) => prev.map((s) => (s.id === siteId ? { ...s, status } : s)));
    } catch (e) {
      setError('Failed to update site status. Check Firestore rules.');
    } finally {
      setSavingSiteId(null);
    }
  };

  const deleteUserEverywhere = async (userDocId: string, authUid: string) => {
    // Best-effort cascade delete across app collections.
    // Note: Firebase Auth user deletion requires server-side Admin SDK.
    const refs: any[] = [];

    const collectDeletes = async (collectionName: string, field: string) => {
      const q = query(collection(firestore, collectionName), where(field, '==', authUid));
      const snap = await getDocs(q);
      for (const d of snap.docs) refs.push(d.ref);
    };

    await collectDeletes('locations', 'supervisorAuthUid');
    await collectDeletes('reviews', 'userUid');
    await collectDeletes('siteVolunteers', 'authUid');

    refs.push(fsDoc(firestore, 'user', userDocId));

    const CHUNK = 450; // keep under Firestore 500 writes limit
    for (let i = 0; i < refs.length; i += CHUNK) {
      const batch = writeBatch(firestore);
      const slice = refs.slice(i, i + CHUNK);
      for (const ref of slice) batch.delete(ref);
      await batch.commit();
    }
  };

  const rejectSupervisorAndDelete = async (u: UserRow) => {
    if (!u.id) return;
    setSavingId(u.id);
    setError('');
    const t = toast.loading('Rejecting and deleting user…');
    try {
      if (u.authUid) {
        await deleteUserEverywhere(u.id, u.authUid);
        setSites((prev) => prev.filter((s) => s.supervisorAuthUid !== u.authUid));
      } else {
        // If authUid is missing, we can still delete the Firestore user doc (no cascade possible).
        await deleteDoc(fsDoc(firestore, 'user', u.id));
      }

      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      toast.success(u.authUid ? 'User deleted.' : 'User deleted (no authUid to cascade).', { id: t });
    } catch (e) {
      toast.error('Failed to delete user data.', { id: t });
      setError('Failed to delete user data. Check Firestore rules.');
    } finally {
      setSavingId(null);
    }
  };

  const deleteUserByAdmin = async (u: UserRow) => {
    if (!u.id) return;
    const currentUid = firebaseAuth.currentUser?.uid ?? null;
    if (currentUid && u.authUid === currentUid) {
      toast.error('You cannot delete the currently signed-in admin.');
      return;
    }

    setSavingId(u.id);
    setError('');
    const t = toast.loading('Deleting user…');
    try {
      if (u.authUid) {
        await deleteUserEverywhere(u.id, u.authUid);
        setSites((prev) => prev.filter((s) => s.supervisorAuthUid !== u.authUid));
      } else {
        await deleteDoc(fsDoc(firestore, 'user', u.id));
      }
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      toast.success('User deleted.', { id: t });
    } catch {
      toast.error('Failed to delete user.', { id: t });
      setError('Failed to delete user. Check Firestore rules.');
    } finally {
      setSavingId(null);
    }
  };

  const rejectSiteOnly = async (s: SiteRow) => {
    setSavingSiteId(s.id);
    setError('');
    const t = toast.loading('Rejecting site submission…');
    try {
      await updateDoc(fsDoc(firestore, 'locations', s.id), { status: 'rejected' });
      setSites((prev) => prev.map((x) => (x.id === s.id ? { ...x, status: 'rejected' } : x)));
      toast.success('Site rejected.', { id: t });
    } catch {
      toast.error('Failed to reject site.', { id: t });
      setError('Failed to reject site. Check Firestore rules.');
    } finally {
      setSavingSiteId(null);
    }
  };

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    navigate('/signin', { replace: true });
  };

  const usersByAuthUid = useMemo(() => {
    const map = new Map<string, UserRow>();
    for (const u of users) {
      if (u.authUid) map.set(u.authUid, u);
    }
    return map;
  }, [users]);

  const supervisors = useMemo(() => users.filter((u) => u.userRole === 'supervisor'), [users]);
  const filteredSupervisors = useMemo(
    () => supervisors.filter((u) => (u.supervisorStatus ?? 'pending') === supervisorTab),
    [supervisors, supervisorTab]
  );
  const filteredSites = useMemo(
    () => sites.filter((s) => (s.status ?? 'pending') === siteTab),
    [sites, siteTab]
  );

  const approveSiteSubmission = async (s: SiteRow) => {
    setSavingSiteId(s.id);
    setError('');
    try {
      await updateDoc(fsDoc(firestore, 'locations', s.id), { status: 'approved' });
      const supervisor = s.supervisorAuthUid ? usersByAuthUid.get(s.supervisorAuthUid) : undefined;
      const isSupervisorPending =
        supervisor?.userRole === 'supervisor' && (supervisor.supervisorStatus ?? 'pending') === 'pending';
      if (isSupervisorPending && supervisor?.id) {
        await updateDoc(fsDoc(firestore, 'user', supervisor.id), { supervisorStatus: 'approved' });
        setUsers((prev) => prev.map((u) => (u.id === supervisor.id ? { ...u, supervisorStatus: 'approved' } : u)));
      }
      setSites((prev) => prev.map((x) => (x.id === s.id ? { ...x, status: 'approved' } : x)));
    } catch {
      setError('Failed to approve submission. Check Firestore rules.');
    } finally {
      setSavingSiteId(null);
    }
  };

  const rejectSubmissionAndDeleteUser = async (s: SiteRow) => {
    const authUid = s.supervisorAuthUid;
    if (!authUid) return;
    const supervisor = usersByAuthUid.get(authUid);

    setSavingSiteId(s.id);
    setError('');
    const t = toast.loading('Rejecting submission and deleting user…');
    try {
      if (supervisor?.id) {
        await deleteUserEverywhere(supervisor.id, authUid);
        setUsers((prev) => prev.filter((u) => u.id !== supervisor.id));
        setSites((prev) => prev.filter((x) => x.supervisorAuthUid !== authUid));
      } else {
        // If the supervisor profile doc isn't present, at least remove the site submission record.
        await deleteDoc(fsDoc(firestore, 'locations', s.id));
        setSites((prev) => prev.filter((x) => x.id !== s.id));
      }
      toast.success('Submission rejected and user deleted.', { id: t });
    } catch {
      toast.error('Failed to delete submission/user data.', { id: t });
      setError('Failed to delete submission/user data. Check Firestore rules.');
    } finally {
      setSavingSiteId(null);
    }
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-brand-950 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-serif font-bold truncate">Admin</div>
              <div className="text-xs text-brand-200 truncate">{profile?.fullName || profile?.email || ''}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/about')}
              className="px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition"
            >
              About
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/15 transition"
            >
              Admin
            </button>
            <button
              onClick={() => setShowProfile((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition"
            >
              <UserRound className="w-4 h-4" /> User Profile
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-red-500/15 hover:bg-red-500/25 text-red-100 transition"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {showProfile ? (
          <div className="max-w-6xl mx-auto mt-4 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm">
            <div className="text-brand-200">Signed in as</div>
            <div className="mt-1 font-bold">{profile?.fullName || '—'}</div>
            <div className="text-brand-200">{profile?.email || '—'}</div>
            <div className="text-brand-200">Role: admin</div>
          </div>
        ) : null}
      </nav>

      {confirm ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <button
            aria-label="Close confirmation"
            onClick={closeConfirm}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative w-full max-w-lg rounded-[2rem] bg-white border border-brand-100 shadow-2xl p-8">
            <div className="text-xs font-bold uppercase tracking-widest text-brand-400">Confirm</div>
            <div className="mt-3 text-2xl font-serif font-bold text-brand-950">{confirm.title}</div>
            {confirm.description ? <div className="mt-3 text-brand-600">{confirm.description}</div> : null}
            <div className="mt-8 flex gap-3 justify-end">
              <button
                onClick={closeConfirm}
                className="px-5 py-3 rounded-2xl border border-brand-100 bg-white hover:bg-brand-50 text-brand-950 font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={runConfirmAction}
                className={`px-5 py-3 rounded-2xl font-bold transition border ${
                  confirm.danger
                    ? 'bg-red-600 hover:bg-red-700 text-white border-red-700'
                    : 'bg-brand-950 hover:bg-brand-800 text-white border-brand-950'
                }`}
              >
                {confirm.confirmText}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="min-h-screen bg-brand-50 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-brand-950 text-white rounded-2xl">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-950">Admin Dashboard</h1>
                <p className="text-brand-500 mt-1">Approve supervisors and sites, and manage roles</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  loadUsers();
                  loadSites();
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-brand-50 text-brand-950 rounded-xl font-bold transition border border-brand-100 shadow-sm"
              >
                <RefreshCcw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Admins', value: roleCounts.admin },
              { label: 'Site Supervisors', value: roleCounts.supervisor },
              { label: 'Volunteers', value: roleCounts.volunteer },
              { label: 'Unknown', value: roleCounts.unknown },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-[2.5rem] border border-brand-100 shadow-sm p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-brand-400">{c.label}</div>
                <div className="mt-3 text-3xl font-serif font-bold text-brand-950">{c.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-brand-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-brand-100 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-brand-950 font-bold">
                <Users className="w-5 h-5" /> Admin Review
              </div>
              {error ? <div className="text-sm text-red-700">{error}</div> : null}
              <div className="flex gap-2">
                {([
                  { key: 'submissions', label: 'Submissions' },
                  { key: 'roles', label: 'User Roles' },
                ] as const).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActive(t.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${
                      active === t.key
                        ? 'bg-brand-950 text-white border-brand-950'
                        : 'bg-white text-brand-700 border-brand-100 hover:bg-brand-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {active === 'submissions' ? (
              <div>
                <div className="border-b border-brand-100 px-6 pt-2 flex">
                  {(['pending', 'approved', 'rejected'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSupervisorTab(tab)}
                      className={`px-6 py-4 font-medium transition-colors relative ${
                        supervisorTab === tab
                          ? 'text-brand-950 border-b-2 border-brand-950'
                          : 'text-brand-500 hover:text-brand-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                        {supervisors.filter((u) => (u.supervisorStatus ?? 'pending') === tab).length}
                      </span>
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="p-10 text-center text-brand-400">Loading supervisors…</div>
                ) : filteredSupervisors.length === 0 ? (
                  <div className="p-10 text-center text-brand-400">No {supervisorTab} supervisors.</div>
                ) : (
                  <div className="divide-y divide-brand-100">
                    {filteredSupervisors.map((u) => (
                      <div key={u.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                        <div className="min-w-0">
                          <div className="font-bold text-brand-950 truncate">{u.fullName || u.email || 'Unnamed user'}</div>
                          <div className="text-sm text-brand-500 truncate">{u.email || 'No email'}</div>
                          <div className="text-sm text-brand-500 truncate">{u.phoneNumber || 'No phone'}</div>
                          <div className="text-sm text-brand-500 truncate">{u.city || 'No city'}</div>
                          <div className="text-xs text-brand-300 truncate">UID: {u.authUid || 'Unknown'}</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-sm text-brand-500">
                            Status:{' '}
                            <span className="font-bold text-brand-950">{u.supervisorStatus ?? 'pending'}</span>
                          </div>

                          {supervisorTab === 'pending' ? (
                            <>
                              <button
                                disabled={savingId === u.id}
                                onClick={() => setSupervisorStatus(u.id, 'approved')}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition border border-emerald-100"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Approve
                              </button>
                              <button
                                disabled={savingId === u.id}
                                onClick={() =>
                                  openConfirm({
                                    title: 'Reject supervisor?',
                                    description:
                                      'This will permanently delete the user and related records (sites, reviews, memberships).',
                                    confirmText: 'Reject & Delete',
                                    danger: true,
                                    action: { kind: 'reject_supervisor', user: u },
                                  })
                                }
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold transition border border-red-100"
                              >
                                <XCircle className="w-4 h-4" /> Reject & Delete
                              </button>
                            </>
                          ) : (
                            <button
                              disabled={savingId === u.id}
                              onClick={() =>
                                openConfirm({
                                  title: 'Delete user?',
                                  description: 'This will permanently delete the user and related records.',
                                  confirmText: 'Delete User',
                                  danger: true,
                                  action: { kind: 'delete_user', user: u },
                                })
                              }
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold transition border border-red-100"
                            >
                              <XCircle className="w-4 h-4" /> Delete User
                            </button>
                          )}

                          {savingId === u.id ? <div className="text-sm text-brand-400">Saving…</div> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {active === 'submissions' ? (
              <div>
                <div className="border-b border-brand-100 px-6 pt-2 flex">
                  {(['pending', 'approved', 'rejected'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSiteTab(tab)}
                      className={`px-6 py-4 font-medium transition-colors relative ${
                        siteTab === tab ? 'text-brand-950 border-b-2 border-brand-950' : 'text-brand-500 hover:text-brand-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                        {sites.filter((s) => (s.status ?? 'pending') === tab).length}
                      </span>
                    </button>
                  ))}
                </div>

                {loadingSites ? (
                  <div className="p-10 text-center text-brand-400">Loading sites…</div>
                ) : filteredSites.length === 0 ? (
                  <div className="p-10 text-center text-brand-400">No {siteTab} sites.</div>
                ) : (
                  <div className="divide-y divide-brand-100">
                    {filteredSites.map((s) => {
                      const supervisor = s.supervisorAuthUid ? usersByAuthUid.get(s.supervisorAuthUid) : undefined;
                      const isSupervisorPending =
                        supervisor?.userRole === 'supervisor' && (supervisor.supervisorStatus ?? 'pending') === 'pending';

                      return (
                        <div key={s.id} className="p-6 flex flex-col gap-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-brand-950">{s.name ?? 'Site'}</div>
                              <div className="text-sm text-brand-500">{s.location ?? 'Unknown location'}</div>
                              <div className="mt-2 text-sm text-brand-600">{s.description ?? 'No description'}</div>

                              <div className="mt-4 p-4 rounded-2xl bg-brand-50 border border-brand-100">
                                <div className="text-xs font-bold uppercase tracking-widest text-brand-400">
                                  Site Supervisor Details
                                </div>
                                <div className="mt-2 text-sm text-brand-700">
                                  <div className="font-bold text-brand-950">{supervisor?.fullName || s.supervisorName || 'Unknown'}</div>
                                  <div>{supervisor?.email || s.email || 'No email'}</div>
                                  <div>{supervisor?.phoneNumber || s.phone || 'No phone'}</div>
                                  <div>{supervisor?.city || 'No city'}</div>
                                  <div className="text-xs text-brand-400 mt-1">UID: {s.supervisorAuthUid || 'Unknown'}</div>
                                  {supervisor?.supervisorStatus ? (
                                    <div className="text-xs text-brand-400 mt-1">
                                      Supervisor status:{' '}
                                      <span className="font-bold text-brand-950">{supervisor.supervisorStatus}</span>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            {siteTab === 'pending' ? (
                              <div className="flex items-center gap-3 self-start">
                                <button
                                  disabled={savingSiteId === s.id}
                                  onClick={() => approveSiteSubmission(s)}
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition border border-emerald-100"
                                >
                                  <CheckCircle2 className="w-4 h-4" /> Approve
                                </button>
                                {isSupervisorPending ? (
                                  <button
                                    disabled={savingSiteId === s.id}
                                  onClick={() =>
                                    openConfirm({
                                      title: 'Reject submission?',
                                      description:
                                        'This supervisor is still pending. Rejecting will permanently delete the user and related records.',
                                      confirmText: 'Reject & Delete',
                                      danger: true,
                                      action: { kind: 'reject_submission_delete_user', site: s },
                                    })
                                  }
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold transition border border-red-100"
                                >
                                  <XCircle className="w-4 h-4" /> Reject & Delete
                                </button>
                                ) : (
                                  <button
                                    disabled={savingSiteId === s.id}
                                    onClick={() =>
                                      openConfirm({
                                        title: 'Reject site?',
                                        description: 'This will mark the site submission as rejected.',
                                        confirmText: 'Reject Site',
                                        danger: true,
                                        action: { kind: 'reject_site', site: s },
                                      })
                                    }
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold transition border border-red-100"
                                  >
                                    <XCircle className="w-4 h-4" /> Reject
                                  </button>
                                )}
                                {savingSiteId === s.id ? <div className="text-sm text-brand-400">Saving…</div> : null}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}

            {active === 'roles' ? (
              <div>
                {loading ? (
                  <div className="p-10 text-center text-brand-400">Loading users…</div>
                ) : users.length === 0 ? (
                  <div className="p-10 text-center text-brand-400">No users found.</div>
                ) : (
                  <div className="divide-y divide-brand-100">
                    {users.map((u) => (
                      <div key={u.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                        <div className="min-w-0">
                          <div className="font-bold text-brand-950 truncate">{u.fullName || u.email || 'Unnamed user'}</div>
                          <div className="text-sm text-brand-500 truncate">{u.email || 'No email'}</div>
                          <div className="text-xs text-brand-300 truncate">UID: {u.authUid || 'Unknown'}</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <select
                            value={u.userRole ?? ''}
                            onChange={(e) => updateRole(u.id, e.target.value as Role)}
                            disabled={savingId === u.id}
                            className="px-4 py-3 bg-brand-50 border border-brand-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                          >
                            <option value="" disabled>
                              Unknown role
                            </option>
                            {ROLE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          <button
                            disabled={savingId === u.id}
                            onClick={() =>
                              openConfirm({
                                title: 'Delete user?',
                                description: 'This will permanently delete the user and related records.',
                                confirmText: 'Delete',
                                danger: true,
                                action: { kind: 'delete_user', user: u },
                              })
                            }
                            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 font-bold transition border border-red-100"
                          >
                            <XCircle className="w-4 h-4" /> Delete
                          </button>

                          {savingId === u.id ? <div className="text-sm text-brand-400">Saving…</div> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
