'use client';

import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { getDefaultRedirectByRole } from '@/lib/auth/roles';
import { RouteGateShell } from '@/components/auth/route-gate-shell';

export function PublicOnlyRoute({ children }: PropsWithChildren) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated && user) {
      router.replace(getDefaultRedirectByRole(user.role));
    }
  }, [isAuthenticated, isHydrated, router, user]);

  if (!isHydrated) {
    return <RouteGateShell />;
  }

  if (isAuthenticated && user) {
    return (
      <RouteGateShell
        title="Redirecting to your workspace"
        body="You are already signed in."
      />
    );
  }

  return <>{children}</>;
}
