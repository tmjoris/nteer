import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { defaultPathForRole, type Role } from '../lib/rbac';

export default function RequireRole(props: {
  allowed: Role[];
  children: ReactNode;
  unauthorizedTo?: string;
}) {
  const { user, role, loading } = useAuth();
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

  if (!role || !props.allowed.includes(role)) {
    const to = props.unauthorizedTo ?? (role ? defaultPathForRole(role) : '/');
    return <Navigate to={to} replace />;
  }

  return <>{props.children}</>;
}

