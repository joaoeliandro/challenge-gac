'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

function getToken() {
  const token = cookies().get('token')?.value;
  if (!token) throw new Error('Não autenticado');
  return token;
}

export async function depositAction(formData: FormData) {
  const amount      = parseFloat(formData.get('amount') as string);
  const description = formData.get('description') as string;

  try {
    await api.post('/wallet/deposit', { amount, description }, getToken());
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function transferAction(formData: FormData) {
  const receiverUserId = formData.get('receiverUserId') as string;
  const amount         = parseFloat(formData.get('amount') as string);
  const description    = formData.get('description') as string;

  try {
    await api.post('/wallet/transfer', { receiverUserId, amount, description }, getToken());
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function reverseAction(transactionId: string) {
  try {
    await api.post(`/wallet/reverse/${transactionId}`, {}, getToken());
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
