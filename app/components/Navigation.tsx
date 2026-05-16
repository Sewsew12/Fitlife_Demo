'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Home, Activity, UtensilsCrossed, MessageSquare, Target, LogOut, ChevronDown } from 'lucide-react';

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',  icon: Home },
  { href: '/activity',   label: 'Activity',   icon: Activity },
  { href: '/food',       label: 'Food diary', icon: UtensilsCrossed },
  { href: '/coach',      label: 'AI Coach',   icon: MessageSquare },
  { href: '/challenges', label: 'Challenges', icon: Target },
];

function active(pathname: string, href: string) {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
}

export default function Navigation({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logging, setLogging] = useState(false);

  const initials = userName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

  async function logout() {
    setLogging(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* ── Desktop / tablet top bar ─────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-sm">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900">FitLife</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active(pathname, href)
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* User menu */}
          <div className="ml-auto relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white">
                {initials}
              </div>
              <span className="hidden sm:inline max-w-24 truncate">{userName}</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-20 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-2">
                    <p className="text-xs font-semibold text-gray-900 truncate">{userName}</p>
                  </div>
                  <button
                    onClick={logout}
                    disabled={logging}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom tab bar ────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-gray-100 bg-white pb-safe md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const isAct = active(pathname, href);
          return (
            <Link key={href} href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
                isAct ? 'text-violet-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isAct ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
