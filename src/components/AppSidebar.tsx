import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Heart, Wallet, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/academic', icon: GraduationCap, label: 'Academic' },
  { to: '/health', icon: Heart, label: 'Health' },
  { to: '/finance', icon: Wallet, label: 'Finance' },
  { to: '/ai', icon: Sparkles, label: 'AI Insights' },
];

const moduleColors: Record<string, string> = {
  '/': 'text-primary',
  '/academic': 'text-academic',
  '/health': 'text-health',
  '/finance': 'text-finance',
  '/ai': 'text-ai',
};

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-display text-lg font-bold text-sidebar-accent-foreground">WellnessAI</span>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {links.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 transition-colors', isActive && moduleColors[to])} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="glass rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Local storage mode</p>
          <p className="mt-1 text-xs text-muted-foreground">Add Cloud for sync & AI</p>
        </div>
      </div>
    </aside>
  );
}
