'use server';

import { AuthError } from 'next-auth';
import { signIn, signOut } from '@/auth';

export type LoginState = {
  error?: string;
};

function safeCallbackUrl(value: FormDataEntryValue | null) {
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//')
    ? value
    : '/dashboard';
}

export async function authenticate(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn('credentials', {
      username: formData.get('username'),
      password: formData.get('password'),
      redirectTo: safeCallbackUrl(formData.get('callbackUrl')),
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Invalid username or password.' };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: '/login' });
}
