import { PublicOnlyRoute } from '@/components/auth/public-only-route';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <PublicOnlyRoute>{children}</PublicOnlyRoute>;
}
