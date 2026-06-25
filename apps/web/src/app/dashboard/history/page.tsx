import { getSession } from '@/lib/session';
import { TransactionList } from '@/components/wallet/transaction-list';

export default async function HistoryPage() {
  const { transactions } = await getSession();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Histórico completo</h2>
        <span style={{ fontSize: '13px', color: '#6b7280' }}>
          {transactions.total} transações
        </span>
      </div>
      <TransactionList transactions={transactions.items} />
    </div>
  );
}
