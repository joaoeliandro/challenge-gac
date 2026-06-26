'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/actions/auth.actions';
import { useEffect, useState, useTransition } from 'react';

const links = [
  { href: '/dashboard',          label: 'Início'     },
  { href: '/dashboard/deposit',  label: 'Depositar'  },
  { href: '/dashboard/transfer', label: 'Transferir' },
  { href: '/dashboard/history',  label: 'Histórico'  },
  { href: '/dashboard/profile',  label: 'Perfil'     },
];

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        height: '56px',
      }}>
        <span style={{ fontWeight: 700, marginRight: '20px', fontSize: '15px', flexShrink: 0 }}>
          💳 Carteira
        </span>

        <div className="nav-desktop-links" style={{ display: 'flex', gap: '2px', flex: 1, overflowX: 'auto' }}>
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
          className="nav-desktop-logout"
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

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          className="nav-hamburger"
          style={{
            marginLeft: 'auto',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: '#111',
            padding: '6px',
            display: 'none',
          }}
        >
          {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {menuOpen && (
        <div className="nav-mobile-panel" style={{
          borderTop: '1px solid #e5e7eb',
          padding: '8px 16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}>
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#111' : '#374151',
                  background: active ? '#f3f4f6' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            );
          })}

          <div style={{ borderTop: '1px solid #e5e7eb', margin: '8px 0' }} />

          <button
            onClick={() => startTransition(() => logoutAction())}
            disabled={isPending}
            style={{
              textAlign: 'left',
              fontSize: '14px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#dc2626',
            }}
          >
            {isPending ? '...' : 'Sair'}
          </button>
        </div>
      )}
    </nav>
  );
}
