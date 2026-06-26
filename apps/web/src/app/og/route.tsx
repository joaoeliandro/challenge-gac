import { ImageResponse } from 'next/og';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          background: '#111',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 160 }}>💳</div>
        <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1 }}>Carteira</div>
      </div>
    ),
    { width: 600, height: 600 }
  );
}
