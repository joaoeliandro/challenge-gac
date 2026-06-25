'use client';

import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
      <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>
        Algo deu errado
      </h2>
      <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px' }}>
        {error.message || 'Erro inesperado. Tente novamente.'}
      </p>
      <Button onClick={reset} variant="secondary">
        Tentar novamente
      </Button>
    </Card>
  );
}
