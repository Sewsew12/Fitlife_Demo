'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { href: '/dashboard',   label: 'Dashboard',  icon: '⚡' },
  { href: '/activity',    label: 'Activity',   icon: '🏃' },
  { href: '/food',        label: 'Food Diary',  icon: '🥗' },
  { href: '/coach',       label: 'AI Coach',   icon: '🤖' },
  { href: '/challenges',  label: 'Challenges', icon: '🏆' },
];

export default function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [logging, setLogging] = useState(false);

  async function handleLogout() {
    setLogging(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const initials = userName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  const NavLinks = () => (
    <nav className="flex flex-col gap-1 flex-1">
      {NAV.map(({ href, label, icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="text-base">{icon}</span>
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-brand-950 px-4 py-6 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 px-1">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm">
            F
          </div>
          <span className="text-white font-bold text-lg tracking-tight">FitLife</span>
        </div>

        <NavLinks />

        {/* User + logout */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <span className="text-white/80 text-sm truncate">{userName}</span>
          </div>
          <button
            onClick={handleLogout}
            disabled={logging}
            className="w-full flex items-center gap-2 text-white/50 hover:text-white hover:bg-white/10
                       px-3 py-2 rounded-xl text-sm transition-colors disabled:opacity-40"
          >
            <span>↩</span> Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <header className="md:hidden flex items-center justify-between bg-brand-950 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-xs">
            F
          </div>
          <span className="text-white font-bold">FitLife</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-white/70 hover:text-white p-1"
          aria-label="Menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-56 bg-brand-950 px-4 py-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-8 px-1">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm">F</div>
              <span className="text-white font-bold text-lg">FitLife</span>
            </div>
            <NavLinks />
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                disabled={logging}
                className="w-full flex items-center gap-2 text-white/50 hover:text-white hover:bg-white/10
                           px-3 py-2 rounded-xl text-sm transition-colors"
              >
                <span>↩</span> Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
