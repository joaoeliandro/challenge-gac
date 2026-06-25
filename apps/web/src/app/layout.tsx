import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carteira | Grupo Adriano Cobuccio',
  description: 'Carteira financeira digital',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f5f5f5', color: '#111' }}>
        {children}
      </body>
    </html>
  );
}
