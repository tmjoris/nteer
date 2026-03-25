import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { defaultPathForRole } from '../lib/rbac';

export default function RoleRedirect() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const state = location.state as any;
      const from = typeof state?.from === 'string' ? state.from : '/redirect';
      navigate('/signin', { replace: true, state: { from } });
      return;
    }

    if (!role) {
      navigate('/', { replace: true });
      return;
    }

    navigate(defaultPathForRole(role), { replace: true });
  }, [loading, user, role, navigate, location]);

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
      <div className="text-brand-500">Redirecting…</div>
    </div>
  );
}
