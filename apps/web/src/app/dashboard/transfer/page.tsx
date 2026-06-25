import { Card } from '@/components/ui/card';
import { TransferForm } from '@/components/wallet/transfer-form';
import { getSession } from '@/lib/session';
import { BalanceCard } from '@/components/wallet/balance-card';

export default async function TransferPage() {
  const { balance } = await getSession();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <BalanceCard balance={balance.balance} />
      <Card>
        <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600 }}>Transferir dinheiro</h2>
        <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280' }}>
          Use o ID (UUID) do usuário de destino. Encontre-o na tela de perfil.
        </p>
        <TransferForm />
      </Card>
    </div>
  );
}
