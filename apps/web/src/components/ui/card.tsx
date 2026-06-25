import { ReactNode, CSSProperties } from 'react';

interface Props {
  children: ReactNode;
  style?: CSSProperties;
}

export function Card({ children, style }: Props) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '24px',
      ...style,
    }}>
      {children}
    </div>
  );
}
