# Next.js Dashboard

A localized English/Thai dashboard built with the Next.js App Router, Tailwind
CSS, Ant Design, PostgreSQL, and a hybrid Atomic Design architecture.

## UI architecture

Shared, domain-neutral UI lives under `app/ui`:

- `atoms/` contains visual primitives with no routing, data, or domain imports.
- `molecules/` contains small reusable interactions such as search, locale,
  pagination, page-size, profile-row, and metric-card controls.
- `organisms/` contains complete shared sections such as the application shell,
  navigation, dialogs, and table containers.
- `templates/` defines fetch-free page composition through React slots.
- `features/` groups customer, dashboard, hospital, and invoice presentation.

App Router `page.tsx` files retain URL parsing and server-data composition.
Route-local `loading.tsx` boundaries retain streaming behavior. Database access,
server actions, validation, and pagination rules remain in `app/lib`.

The migration source of truth and verification record is
`docs/atomic-design-migration-plan.md`.

## Development

```bash
npm install
npm run dev
```

Verification:

```bash
npx tsc --noEmit
npm run build:load-test
git diff --check
```

## Local hospital load-test database

The load-test profile runs PostgreSQL 17 on port `5433` and initializes 12,000
deterministic hospital records.

```bash
docker compose -f docker-compose.load-test.yml up -d
npm run dev:load-test
```

Open `http://localhost:3000/support`.

The connection settings live in `.env.local-load-test`. The seed is idempotent,
but PostgreSQL initialization scripts run only when the Docker volume is first
created.

```bash
docker compose -f docker-compose.load-test.yml ps
docker compose -f docker-compose.load-test.yml exec postgres-load-test \
  psql -U hospital -d hospital_load_test -c "SELECT COUNT(*) FROM hospital;"
```
