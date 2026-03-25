export type Role = 'admin' | 'supervisor' | 'volunteer';

export function normalizeRole(value: unknown): Role | null {
  if (typeof value !== 'string') return null;
  const role = value.trim().toLowerCase();

  if (role === 'admin') return 'admin';
  if (role === 'volunteer') return 'volunteer';

  // Accept common variants for "Site supervisor"
  if (
    role === 'supervisor' ||
    role === 'site supervisor' ||
    role === 'site_supervisor' ||
    role === 'site-supervisor'
  ) {
    return 'supervisor';
  }

  return null;
}

export function defaultPathForRole(role: Role): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'supervisor':
      return '/supervisor';
    case 'volunteer':
      return '/sites';
  }
}

