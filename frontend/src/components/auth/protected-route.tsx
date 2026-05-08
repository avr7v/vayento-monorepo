'use client';

import { PropsWithChildren, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import {
  getDefaultRedirectByRole,
  hasRequiredRole,
  UserRole,
} from '@/lib/auth/roles';
import { RouteGateShell } from '@/components/auth/route-gate-shell';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

export function ProtectedRoute({
  allowedRoles,
  children,
}: PropsWithChildren<ProtectedRouteProps>) {
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated || !user) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${next}`);
      return;
    }

    if (!hasRequiredRole(user.role, allowedRoles)) {
      router.replace(getDefaultRedirectByRole(user.role));
    }
  }, [allowedRoles, isAuthenticated, isHydrated, pathname, router, user]);

  if (!isHydrated) {
    return <RouteGateShell />;
  }

  if (!isAuthenticated || !user) {
    return (
      <RouteGateShell
        title="Redirecting to sign in"
        body="You need an authenticated session to access this area."
      />
    );
  }

  if (!hasRequiredRole(user.role, allowedRoles)) {
    return (
      <RouteGateShell
        title="Redirecting to your workspace"
        body="This workspace is not available for your current role."
      />
    );
  }

  return <>{children}</>;
}