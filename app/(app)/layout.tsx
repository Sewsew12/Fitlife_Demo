import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Sidebar from '@/app/components/Sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={session.name} />
      <main className="flex-1 flex flex-col overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
