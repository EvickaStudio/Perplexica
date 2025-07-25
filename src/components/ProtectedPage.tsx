'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedPageProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedPage({
  children,
  requireAdmin = false,
}: ProtectedPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (requireAdmin && !(session.user as any)?.isAdmin) {
      router.push('/');
      return;
    }
  }, [session, status, router, requireAdmin]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-primary dark:bg-dark-primary">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-black/70 dark:text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  if (requireAdmin && !(session.user as any)?.isAdmin) {
    return null; // Will redirect to home
  }

  return <>{children}</>;
}
