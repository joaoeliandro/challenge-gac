import { cookies } from 'next/headers';
import { api } from '@/lib/api';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { CopyIdButton } from '@/components/wallet/copy-id-button';

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
  const me = await getMe();

  return (
    <Card>
      <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600 }}>Meu perfil</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
            Seu ID (use para receber transferências)
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}>
            <span style={{ fontSize: '13px', fontFamily: 'monospace', wordBreak: 'break-all', flex: 1, minWidth: 0 }}>
              {me?.id}
            </span>
            <CopyIdButton value={me?.id} />
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
          Compartilhe seu ID para receber transferências de outros usuários.
        </p>
      </div>
    </Card>
  );
}
