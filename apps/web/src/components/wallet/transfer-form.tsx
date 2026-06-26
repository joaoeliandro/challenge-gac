'use client';

import { useState, useTransition } from 'react';
import { transferAction } from '@/actions/wallet.actions';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export function TransferForm() {
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string }>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setStatus(undefined);
    startTransition(async () => {
      const res = await transferAction(formData);
      if (res?.error)   setStatus({ type: 'error',   msg: res.error });
      if (res?.success) setStatus({ type: 'success', msg: 'Transferência realizada com sucesso!' });
    });
  }

  return (
    <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <Input
          label="ID do destinatário"
          name="receiverUserId"
          type="text"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          required
        />
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>
          O destinatário encontra o seu ID na aba Perfil.
        </p>
      </div>

      <MoneyInput label="Valor (R$)" name="amount" required />

      <Input
        label="Descrição (opcional)"
        name="description"
        type="text"
        placeholder="Ex: Pagamento do almoço"
      />

      {status && <Alert type={status.type} message={status.msg} />}

      <Button type="submit" fullWidth loading={isPending}>
        Transferir
      </Button>
    </form>
  );
}
