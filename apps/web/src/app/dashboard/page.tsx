import { getSession } from '@/lib/session';
import { BalanceCard } from '@/components/wallet/balance-card';
import { TransactionList } from '@/components/wallet/transaction-list';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default async function DashboardPage() {
  const { balance, transactions } = await getSession();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <BalanceCard balance={balance.balance} />

      {/* Ações rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[
          { href: '/dashboard/deposit',  label: '↓ Depositar',  bg: '#f0fdf4', color: '#16a34a' },
          { href: '/dashboard/transfer', label: '↑ Transferir', bg: '#eff6ff', color: '#2563eb' },
        ].map(({ href, label, bg, color }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <Card style={{ textAlign: 'center', padding: '20px', background: bg, border: 'none', cursor: 'pointer' }}>
              <span style={{ fontWeight: 600, color, fontSize: '14px' }}>{label}</span>
            </Card>
          </Link>
        ))}
      </div>

      {/* Últimas transações */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Últimas transações</h2>
          <Link href="/dashboard/history" style={{ fontSize: '13px', color: '#6b7280' }}>
            Ver todas →
          </Link>
        </div>
        <TransactionList transactions={transactions.items.slice(0, 5)} />
      </div>
    </div>
  );
}
