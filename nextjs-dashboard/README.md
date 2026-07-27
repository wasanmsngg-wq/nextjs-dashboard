# Next.js Dashboard

A localized English/Thai dashboard built with the Next.js App Router,
Tailwind CSS, Ant Design, PostgreSQL, and a hybrid Atomic Design architecture.

The application currently provides an authenticated empty dashboard and a
searchable customer directory.

## Development

```bash
pnpm install
pnpm dev
```

Authentication uses a single environment-configured account. Configure these
values in an ignored local environment file:

```dotenv
AUTH_SECRET=<random secret>
AUTH_ADMIN_USERNAME=<username>
AUTH_ADMIN_PASSWORD_HASH=<bcrypt password hash>
POSTGRES_URL=<PostgreSQL connection URL>
```

The browser tests additionally read test login values from the ignored
`.env.auth.local` file:

```dotenv
AUTH_TEST_USERNAME=<username>
AUTH_TEST_PASSWORD=<password>
```

## Verification

```bash
pnpm test
pnpm build
pnpm test:e2e
git diff --check
```
