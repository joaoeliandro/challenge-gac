import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';

const TITLE = 'Carteira | Grupo Adriano Cobuccio';
const DESCRIPTION = 'Carteira financeira digital';

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = headers();
  const host  = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000';
  const proto = requestHeaders.get('x-forwarded-proto') ?? 'http';

  return {
    metadataBase: new URL(`${proto}://${host}`),
    title: TITLE,
    description: DESCRIPTION,
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      siteName: 'Carteira',
      type: 'website',
      images: [`${proto}://${host}/og`],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f5f5f5', color: '#111' }}>
        {children}
      </body>
    </html>
  );
}
