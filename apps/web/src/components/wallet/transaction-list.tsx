'use client';

import { useState, useTransition } from 'react';
import { reverseAction } from '@/actions/wallet.actions';

type TxType   = 'DEPOSIT' | 'TRANSFER' | 'REVERSAL';
type TxStatus = 'PENDING' | 'COMPLETED' | 'REVERSED' | 'FAILED';

interface WalletRef {
  id:   string;
  user: { id: string; name: string; email: string };
}

interface Transaction {
  id:               string;
  type:             TxType;
  status:           TxStatus;
  amount:           string;
  description:      string | null;
  createdAt:        string;
  senderWallet?:    WalletRef | null;
  receiverWallet:   WalletRef;
  reversal?:        { id: string } | null;
}

function isCredit(tx: Transaction, currentWalletId: string): boolean {
  if (tx.type === 'DEPOSIT') return true;
  if (tx.type === 'TRANSFER') return tx.receiverWallet.id === currentWalletId;
  return tx.senderWallet?.id === currentWalletId;
}

function getCounterparty(tx: Transaction, currentWalletId: string): { label: string; user: WalletRef['user'] } | null {
  if (tx.type === 'TRANSFER') {
    return isCredit(tx, currentWalletId)
      ? { label: 'De',   user: tx.senderWallet!.user }
      : { label: 'Para', user: tx.receiverWallet.user };
  }

  if (tx.type === 'REVERSAL') {
    if (isCredit(tx, currentWalletId)) {
      return { label: 'Devolvido por', user: tx.receiverWallet.user };
    }
    return tx.senderWallet ? { label: 'Estornado para', user: tx.senderWallet.user } : null;
  }

  return null;
}

const typeLabel: Record<TxType, string> = {
  DEPOSIT:  'Depósito',
  TRANSFER: 'Transferência',
  REVERSAL: 'Reversão',
};

const statusColor: Record<TxStatus, string> = {
  COMPLETED: '#16a34a',
  PENDING:   '#d97706',
  REVERSED:  '#6b7280',
  FAILED:    '#dc2626',
};

const statusLabel: Record<TxStatus, string> = {
  COMPLETED: 'Concluída',
  PENDING:   'Pendente',
  REVERSED:  'Revertida',
  FAILED:    'Falhou',
};

function formatBRL(amount: string | number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(amount));
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(dateStr));
}

function ReverseButton({ txId }: { txId: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  if (done) return <span style={{ fontSize: '11px', color: '#16a34a' }}>✓ Revertida</span>;

  return (
    <div>
      <button
        onClick={() => {
          if (!confirm('Confirmar reversão desta transação?')) return;
          setError(undefined);
          startTransition(async () => {
            const res = await reverseAction(txId);
            if (res?.error)   setError(res.error);
            if (res?.success) setDone(true);
          });
        }}
        disabled={isPending}
        style={{
          fontSize: '11px',
          padding: '4px 10px',
          borderRadius: '6px',
          border: '1px solid #fca5a5',
          background: '#fef2f2',
          color: '#dc2626',
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {isPending ? '...' : 'Reverter'}
      </button>
      {error && <p style={{ fontSize: '11px', color: '#dc2626', margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}

export function TransactionList({ transactions, currentWalletId }: { transactions: Transaction[]; currentWalletId: string }) {
  if (!transactions.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: '14px' }}>
        Nenhuma transação ainda. Faça um depósito para começar!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {transactions.map((tx) => {
        const credit       = isCredit(tx, currentWalletId);
        const counterparty = getCounterparty(tx, currentWalletId);

        return (
          <div
            key={tx.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              background: '#fff',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              opacity: tx.status === 'REVERSED' ? 0.6 : 1,
            }}
          >
            {/* Ícone do tipo */}
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '8px',
              background: tx.type === 'REVERSAL' ? '#f9fafb' : credit ? '#f0fdf4' : '#eff6ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', flexShrink: 0,
            }}>
              {tx.type === 'REVERSAL' ? '↩' : credit ? '↓' : '↑'}
            </div>

            {/* Descrição */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{typeLabel[tx.type]}</span>
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                  background: '#f3f4f6', color: statusColor[tx.status],
                  fontWeight: 500,
                }}>
                  {statusLabel[tx.status]}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tx.description || (tx.type === 'DEPOSIT' ? 'Depósito' : 'Estorno')}
              </p>
              {counterparty && (
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {counterparty.label} {counterparty.user.name}{' '}
                  <span style={{ fontFamily: 'monospace', color: '#9ca3af' }}>({counterparty.user.id})</span>
                </p>
              )}
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#d1d5db' }}>
                {formatDate(tx.createdAt)}
              </p>
            </div>

            {/* Valor */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontSize: '14px', fontWeight: 700,
                color: credit ? '#16a34a' : '#111',
              }}>
                {credit ? '+' : '-'}
                {formatBRL(tx.amount)}
              </div>

              {/* Botão reverter só aparece para transações COMPLETED e reversíveis */}
              {(tx.type === 'DEPOSIT' || tx.type === 'TRANSFER') &&
                tx.status === 'COMPLETED' && !tx.reversal && (
                <div style={{ marginTop: '6px' }}>
                  <ReverseButton txId={tx.id} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
