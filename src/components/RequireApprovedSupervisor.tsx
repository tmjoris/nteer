import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function RequireApprovedSupervisor(props: { children: ReactNode }) {
  const { user, role, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
        <div className="text-brand-500">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname + location.search }} />;
  }

  if (role === 'admin') return <>{props.children}</>;

  if (role !== 'supervisor') {
    return <Navigate to="/sites" replace />;
  }

  if (profile?.supervisorStatus === 'approved') {
    return <>{props.children}</>;
  }

  return <Navigate to="/supervisor-approval" replace />;
}

