import { InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, ...props }, ref) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
        {label}
      </label>
      <input
        ref={ref}
        style={{
          padding: '10px 12px',
          borderRadius: '8px',
          border: `1px solid ${error ? '#dc2626' : '#d1d5db'}`,
          fontSize: '14px',
          outline: 'none',
          background: '#fff',
          color: '#111',
          width: '100%',
          boxSizing: 'border-box',
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '12px', color: '#dc2626' }}>{error}</span>}
    </div>
  )
);
Input.displayName = 'Input';
