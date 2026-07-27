import type { NextAuthConfig } from 'next-auth';

export default {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [],
  trustHost: true,
} satisfies NextAuthConfig;
