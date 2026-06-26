'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 7 11 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61C3.35 8.36 1 12 1 12s4 7 11 7a9.93 9.93 0 0 0 5.39-1.61" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, type, style, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
          {label}
        </label>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            style={{
              padding: '10px 12px',
              paddingRight: isPassword ? '40px' : '12px',
              borderRadius: '8px',
              border: `1px solid ${error ? '#dc2626' : '#d1d5db'}`,
              fontSize: '16px',
              outline: 'none',
              background: '#fff',
              color: '#111',
              width: '100%',
              boxSizing: 'border-box',
              ...style,
            }}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              tabIndex={-1}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                color: '#6b7280',
              }}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>
        {error && <span style={{ fontSize: '12px', color: '#dc2626' }}>{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
