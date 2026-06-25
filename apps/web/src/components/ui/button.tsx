import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const styles: Record<Variant, string> = {
  primary:   'background:#111;color:#fff;border:1px solid #111;',
  secondary: 'background:#fff;color:#111;border:1px solid #d1d5db;',
  danger:    'background:#dc2626;color:#fff;border:1px solid #dc2626;',
  ghost:     'background:transparent;color:#6b7280;border:1px solid transparent;',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary', loading, fullWidth, children, disabled, style, ...props
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 500,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'opacity 0.15s',
        width: fullWidth ? '100%' : undefined,
        ...Object.fromEntries(
          styles[variant].split(';').filter(Boolean).map(s => {
            const [k, v] = s.split(':');
            return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v.trim()];
          })
        ),
        ...style,
      }}
      {...props}
    >
      {loading ? '...' : children}
    </button>
  );
}
