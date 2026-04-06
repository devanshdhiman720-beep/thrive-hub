import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen evo-particles">
      <AppSidebar />
      <main className="relative z-10 ml-64 flex-1 p-8">
        <div className="mx-auto max-w-6xl animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
