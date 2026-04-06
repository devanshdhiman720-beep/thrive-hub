import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Heart, Wallet, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWellnessStore } from '@/store/wellnessStore';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/academic', icon: GraduationCap, label: 'Study Tracker' },
  { to: '/health', icon: Heart, label: 'Health & Mood' },
  { to: '/finance', icon: Wallet, label: 'Finance Tracker' },
  { to: '/ai', icon: Sparkles, label: 'AI Insights' },
];

export function AppSidebar() {
  const location = useLocation();
  const { subjects, studySessions, habits, expenses } = useWellnessStore();

  // Simple XP calculation
  const xp = studySessions.length * 15 + habits.reduce((s, h) => s + h.completedDates.length, 0) * 10 + expenses.length * 5;
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-primary/15 bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <span className="font-display text-lg font-bold text-primary">EvoLife</span>
          <p className="text-[10px] text-muted-foreground tracking-wider">विकास यात्रा</p>
        </div>
      </div>

      {/* User Profile */}
      <div className="mx-3 mt-2 rounded-xl border border-primary/20 bg-card/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Student</p>
            <p className="text-xs text-primary">🌱 Level {level}</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>XP Progress</span>
            <span>{xpInLevel}/100</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-health transition-all"
              style={{ width: `${xpInLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-6 flex flex-1 flex-col gap-1 px-3">
        {links.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-sidebar-foreground hover:bg-primary/5 hover:text-primary/80'
              )}
            >
              <Icon className={cn('h-5 w-5 transition-colors', isActive ? 'text-primary' : '')} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-primary/10 p-4">
        <div className="evo-card !p-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-primary/60">Local Storage Mode</p>
          <p className="mt-1 text-[10px] text-muted-foreground">Add Cloud for sync & AI</p>
        </div>
      </div>
    </aside>
  );
}
