import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { api } from './api';

export async function getSession() {
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');

  try {
    const [balance, transactions] = await Promise.all([
      api.get('/wallet/balance',                    token),
      api.get('/wallet/transactions?page=1&limit=20', token),
    ]);
    return { token, balance, transactions };
  } catch {
    redirect('/login');
  }
}

export async function getCurrentUser() {
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');
  return { token };
}
