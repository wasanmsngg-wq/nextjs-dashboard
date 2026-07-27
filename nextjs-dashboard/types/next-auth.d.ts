import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: 'admin' | 'viewer';
  }

  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: 'admin' | 'viewer';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'admin' | 'viewer';
  }
}
