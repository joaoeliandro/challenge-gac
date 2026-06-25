export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Skeleton do balance card */}
      <div style={{
        background: '#e5e7eb',
        borderRadius: '16px',
        height: '120px',
        animation: 'pulse 1.5s ease-in-out infinite',
      }} />
      {/* Skeleton das ações */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            background: '#e5e7eb',
            borderRadius: '12px',
            height: '72px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
      </div>
      {/* Skeleton das transações */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          background: '#e5e7eb',
          borderRadius: '10px',
          height: '64px',
          animation: 'pulse 1.5s ease-in-out infinite',
          opacity: 1 - i * 0.2,
        }} />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
