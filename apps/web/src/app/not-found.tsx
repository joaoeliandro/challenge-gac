import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      textAlign: 'center',
      padding: '24px',
    }}>
      <span style={{ fontSize: '56px' }}>404</span>
      <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Página não encontrada</h1>
      <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
        A página que você procura não existe.
      </p>
      <Link
        href="/dashboard"
        style={{
          padding: '10px 20px',
          background: '#111',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        Voltar ao início
      </Link>
    </div>
  );
}
