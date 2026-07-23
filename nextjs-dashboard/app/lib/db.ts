import postgres from 'postgres';

const useSsl = process.env.POSTGRES_SSL !== 'false';

export const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: useSsl ? 'require' : false,
  prepare: false,
  max: Number(process.env.POSTGRES_POOL_SIZE ?? 10),
  transform: postgres.toCamel,
});

export const sqlRaw = postgres(process.env.POSTGRES_URL!, {
  ssl: useSsl ? 'require' : false,
  prepare: false,
  max: Number(process.env.POSTGRES_POOL_SIZE ?? 10),
});
