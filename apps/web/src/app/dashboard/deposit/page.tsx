import { Card } from '@/components/ui/card';
import { DepositForm } from '@/components/wallet/deposit-form';
import { getSession } from '@/lib/session';
import { BalanceCard } from '@/components/wallet/balance-card';

export default async function DepositPage() {
  const { balance } = await getSession();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <BalanceCard balance={balance.balance} />
      <Card>
        <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600 }}>Depositar dinheiro</h2>
        <DepositForm />
      </Card>
    </div>
  );
}
