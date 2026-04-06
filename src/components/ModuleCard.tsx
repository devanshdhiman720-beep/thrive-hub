import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ModuleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glowClass?: string;
}

export function ModuleCard({ children, className, glowClass, ...props }: ModuleCardProps) {
  return (
    <div className={cn('evo-card', glowClass, className)} {...props}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accentClass?: string;
}

export function StatCard({ label, value, icon, accentClass }: StatCardProps) {
  return (
    <ModuleCard>
      <p className="section-title mb-2">{label}</p>
      <p className="font-display text-3xl font-bold text-foreground">{value}</p>
      {icon && (
        <div className={cn('mt-2 flex h-8 w-8 items-center justify-center rounded-lg', accentClass)}>
          {icon}
        </div>
      )}
    </ModuleCard>
  );
}
