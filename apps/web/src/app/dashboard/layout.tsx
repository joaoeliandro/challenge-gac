import { Nav } from '@/components/wallet/nav';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Nav />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '28px 16px' }}>
        {children}
      </main>
    </div>
  );
}
