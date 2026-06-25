'use client';

import { useState } from 'react';

interface Props {
  balance: string | number;
  userName?: string;
}

export function BalanceCard({ balance, userName }: Props) {
  const [visible, setVisible] = useState(true);

  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
  }).format(Number(balance));

  return (
    <div style={{
      background: '#111',
      color: '#fff',
      borderRadius: '16px',
      padding: '28px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Detalhe decorativo */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 140, height: 140, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />

      {userName && (
        <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
          Olá, {userName.split(' ')[0]} 👋
        </p>
      )}

      <p style={{ margin: '0 0 6px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
        Saldo disponível
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-1px' }}>
          {visible ? formatted : '••••••'}
        </span>
        <button
          onClick={() => setVisible(v => !v)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 8px',
            cursor: 'pointer',
            color: '#fff',
            fontSize: '12px',
          }}
        >
          {visible ? 'Ocultar' : 'Revelar'}
        </button>
      </div>
    </div>
  );
}
