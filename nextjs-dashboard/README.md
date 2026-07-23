## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

## Local hospital load-test database

The load-test profile runs PostgreSQL 17 on port `5433` and initializes
12,000 deterministic hospital records.

```bash
docker compose -f docker-compose.load-test.yml up -d
npm run dev:load-test
```

Open `http://localhost:3000/support`.

The Next.js connection settings live in `.env.local-load-test`. The seed is
idempotent, but PostgreSQL initialization scripts run only when the Docker
volume is first created.

```bash
docker compose -f docker-compose.load-test.yml ps
docker compose -f docker-compose.load-test.yml exec postgres-load-test \
  psql -U hospital -d hospital_load_test -c "SELECT COUNT(*) FROM hospital;"
```
