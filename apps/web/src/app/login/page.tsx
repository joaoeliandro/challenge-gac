'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { loginAction } from '@/actions/auth.actions';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function LoginPage() {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>Carteira</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Acesse sua conta</p>
        </div>

        <Card>
          <form ref={formRef} action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="E-mail" name="email" type="email" placeholder="alice@carteira.dev" required />
            <Input label="Senha"  name="password" type="password" placeholder="••••••" required />

            {error && <Alert type="error" message={error} />}

            <Button type="submit" fullWidth loading={isPending}>
              Entrar
            </Button>
          </form>
        </Card>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
          Não tem conta?{' '}
          <Link href="/register" style={{ color: '#111', fontWeight: 500 }}>Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
