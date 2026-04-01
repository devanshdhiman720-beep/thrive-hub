import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ModuleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glowClass?: string;
}

export function ModuleCard({ children, className, glowClass, ...props }: ModuleCardProps) {
  return (
    <div className={cn('glass rounded-xl p-6 transition-all hover:border-border', glowClass, className)} {...props}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  accentClass?: string;
}

export function StatCard({ label, value, icon, accentClass }: StatCardProps) {
  return (
    <ModuleCard className="flex items-center gap-4">
      <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', accentClass)}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-display text-2xl font-bold">{value}</p>
      </div>
    </ModuleCard>
  );
}
