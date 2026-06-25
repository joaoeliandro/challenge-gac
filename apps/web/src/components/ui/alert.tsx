type AlertType = 'error' | 'success' | 'info';

const cfg: Record<AlertType, { bg: string; border: string; color: string }> = {
  error:   { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
  success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a' },
  info:    { bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb' },
};

export function Alert({ type = 'info', message }: { type?: AlertType; message: string }) {
  const c = cfg[type];
  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '8px',
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.color,
      fontSize: '13px',
      fontWeight: 500,
    }}>
      {message}
    </div>
  );
}
