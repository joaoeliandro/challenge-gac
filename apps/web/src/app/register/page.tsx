'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { registerAction } from '@/actions/auth.actions';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function RegisterPage() {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(undefined);
    const password = formData.get('password') as string;
    const confirm  = formData.get('confirmPassword') as string;
    if (password !== confirm) { setError('As senhas não conferem'); return; }

    startTransition(async () => {
      const result = await registerAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="full-height-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>Criar conta</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Comece a usar a Carteira</p>
        </div>

        <Card>
          <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Nome completo" name="name"            type="text"     placeholder="Alice Silva"        required />
            <Input label="E-mail"        name="email"           type="email"    placeholder="alice@carteira.dev" required />
            <Input label="Senha"         name="password"        type="password" placeholder="Mínimo 6 caracteres" required />
            <Input label="Confirmar senha" name="confirmPassword" type="password" placeholder="••••••"           required />

            {error && <Alert type="error" message={error} />}

            <Button type="submit" fullWidth loading={isPending}>
              Criar conta
            </Button>
          </form>
        </Card>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: '#111', fontWeight: 500 }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
