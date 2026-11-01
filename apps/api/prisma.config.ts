import { defineConfig, env } from 'prisma/config';

// Prisma 7 CLI no longer reads .env on its own
try {
  process.loadEnvFile();
} catch {}

export default defineConfig({
  schema: 'prisma/schema',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
