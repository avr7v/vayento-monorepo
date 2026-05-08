export type UserRole = 'USER' | 'HOST' | 'ADMIN';

export function hasRequiredRole(
  role: UserRole | undefined,
  allowedRoles: UserRole[],
) {
  if (!role) return false;

  return allowedRoles.includes(role);
}

export function getDefaultRedirectByRole(role: UserRole | undefined) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'HOST') return '/host';
  if (role === 'USER') return '/dashboard';

  return '/login';
}

export function isWorkspacePathAllowedForRole(
  path: string | null | undefined,
  role: UserRole | undefined,
) {
  if (!path || !role) return false;

  if (path.startsWith('/admin')) {
    return role === 'ADMIN';
  }

  if (path.startsWith('/host')) {
    return role === 'HOST';
  }

  if (path.startsWith('/dashboard')) {
    return role === 'USER';
  }

  return true;
}