'use client';

import { useState, useTransition } from 'react';
import { depositAction } from '@/actions/wallet.actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export function DepositForm() {
  const [status, setStatus] = useState<{ type: 'error'|'success'; msg: string }>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setStatus(undefined);
    startTransition(async () => {
      const res = await depositAction(formData);
      if (res?.error)   setStatus({ type: 'error',   msg: res.error });
      if (res?.success) setStatus({ type: 'success', msg: 'Depósito realizado com sucesso!' });
    });
  }

  return (
    <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input
        label="Valor (R$)"
        name="amount"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0,00"
        required
      />
      <Input
        label="Descrição (opcional)"
        name="description"
        type="text"
        placeholder="Ex: Recarga mensal"
      />
      {status && <Alert type={status.type} message={status.msg} />}
      <Button type="submit" fullWidth loading={isPending}>
        Depositar
      </Button>
    </form>
  );
}
