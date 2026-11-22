import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { PageSkeleton } from '@/components/common/PageSkeleton';
import { VmsBackdrop } from '@/components/brand/VmsBackdrop';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative isolate flex min-h-screen bg-background">
      <VmsBackdrop />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-w-0 flex-1">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
