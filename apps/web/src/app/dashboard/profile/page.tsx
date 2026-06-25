import { cookies } from 'next/headers';
import { api } from '@/lib/api';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';

async function getMe() {
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');
  try {
    return await api.get('/auth/me', token);
  } catch {
    redirect('/login');
  }
}

export default async function ProfilePage() {
  // O endpoint /auth/me será adicionado no AuthController
  // Por ora exibe o walletId direto do balance
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');

  let balance: any;
  try {
    balance = await api.get('/wallet/balance', token);
  } catch {
    redirect('/login');
  }

  return (
    <Card>
      <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600 }}>Meu perfil</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
            Wallet ID (use para receber transferências)
          </label>
          <div style={{
            padding: '10px 14px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
          }}>
            {balance?.walletId}
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
          Compartilhe seu Wallet ID para receber transferências de outros usuários.
        </p>
      </div>
    </Card>
  );
}
