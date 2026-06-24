'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';

export async function loginAction(formData: FormData) {
  const email    = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const data = await api.post('/auth/login', { email, password });
    cookies().set('token', data.accessToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      maxAge:   60 * 60 * 24 * 7, // 7 dias
      path:     '/',
    });
  } catch (err: any) {
    return { error: err.message };
  }

  redirect('/dashboard');
}

export async function registerAction(formData: FormData) {
  const name     = formData.get('name') as string;
  const email    = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const data = await api.post('/auth/register', { name, email, password });
    cookies().set('token', data.accessToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      maxAge:   60 * 60 * 24 * 7,
      path:     '/',
    });
  } catch (err: any) {
    return { error: err.message };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  cookies().delete('token');
  redirect('/login');
}
