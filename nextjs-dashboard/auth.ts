import bcrypt from 'bcrypt';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import authConfig from '@/auth.config';

const credentialsSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        const configuredUsername = process.env.AUTH_ADMIN_USERNAME;
        const configuredPasswordHash = process.env.AUTH_ADMIN_PASSWORD_HASH;

        if (
          !parsed.success ||
          !configuredUsername ||
          !configuredPasswordHash ||
          parsed.data.username !== configuredUsername
        ) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          parsed.data.password,
          configuredPasswordHash,
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: 'local-admin',
          name: configuredUsername,
          role: 'admin' as const,
        };
      },
    }),
  ],
});
