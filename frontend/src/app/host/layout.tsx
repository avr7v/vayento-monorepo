import { ProtectedRoute } from '@/components/auth/protected-route';

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute allowedRoles={['HOST']}>{children}</ProtectedRoute>;
}