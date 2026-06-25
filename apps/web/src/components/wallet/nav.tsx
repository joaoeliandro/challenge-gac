'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/actions/auth.actions';
import { useTransition } from 'react';

const links = [
  { href: '/dashboard',          label: 'Início'     },
  { href: '/dashboard/deposit',  label: 'Depositar'  },
  { href: '/dashboard/transfer', label: 'Transferir' },
  { href: '/dashboard/history',  label: 'Histórico'  },
  { href: '/dashboard/profile',  label: 'Perfil'     },
];

export function Nav() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      height: '56px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <span style={{ fontWeight: 700, marginRight: '20px', fontSize: '15px', flexShrink: 0 }}>
        💳 Carteira
      </span>

      <div style={{ display: 'flex', gap: '2px', flex: 1, overflowX: 'auto' }}>
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: active ? 600 : 400,
                color: active ? '#111' : '#6b7280',
                background: active ? '#f3f4f6' : 'transparent',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <button
        onClick={() => startTransition(() => logoutAction())}
        disabled={isPending}
        style={{
          fontSize: '13px',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          background: 'transparent',
          cursor: 'pointer',
          color: '#6b7280',
          flexShrink: 0,
          marginLeft: '8px',
        }}
      >
        {isPending ? '...' : 'Sair'}
      </button>
    </nav>
  );
}
