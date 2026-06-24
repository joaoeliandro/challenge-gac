const API_URL = process.env.API_URL || 'http://localhost:3001';

async function fetchWithAuth(path: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  post: (path: string, body: unknown, token?: string) =>
    fetchWithAuth(path, { method: 'POST', body: JSON.stringify(body) }, token),

  get: (path: string, token?: string) =>
    fetchWithAuth(path, { method: 'GET' }, token),
};
