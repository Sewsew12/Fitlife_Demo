import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Navigation from '@/app/components/Navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userName={session.name} />
      <main className="mx-auto max-w-7xl px-3 py-4 pb-24 sm:px-6 sm:py-8 md:pb-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
