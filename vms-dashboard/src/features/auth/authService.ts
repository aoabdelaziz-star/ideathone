import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(3, 'requiredUsername'),
  password: z.string().min(6, 'requiredPassword'),
  remember: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;

export interface AuthUser {
  username: string;
  displayName: string;
  role: string;
}

export type AuthErrorCode = 'invalid_credentials' | 'rate_limited' | 'offline' | 'unknown' | 'validation';

export class AuthError extends Error {
  constructor(public code: AuthErrorCode) {
    super(code);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
    const data = (await response.json().catch(() => ({}))) as T & { message?: string };
    if (!response.ok) throw new AuthError((data.message as AuthErrorCode) ?? 'unknown');
    return data;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError('offline');
  }
}

export const authService = {
  login(values: LoginValues) {
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) throw new AuthError('validation');
    return request<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    });
  },
  session() {
    return request<{ user: AuthUser }>('/api/auth/session');
  },
  logout() {
    return request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
  },
};
