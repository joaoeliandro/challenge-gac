import { execSync } from 'node:child_process';

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

import { envSchema } from '../src/common/config/env';

config({ path: '.env.test', override: true });

const env = envSchema.parse(process.env);

const databaseName = new URL(env.DATABASE_URL).pathname.replace('/', '');
const adminUrl = env.DATABASE_URL.replace(`/${databaseName}`, '/postgres');
const adminPrisma = new PrismaClient({ datasources: { db: { url: adminUrl } } });

beforeAll(async () => {
  const [{ exists }] = await adminPrisma.$queryRaw<[{ exists: boolean }]>`
    SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = ${databaseName}) AS exists
  `;

  if (!exists) {
    await adminPrisma.$executeRawUnsafe(`CREATE DATABASE "${databaseName}"`);
  }

  await adminPrisma.$disconnect();

  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: env.DATABASE_URL },
    stdio: 'inherit',
  });
}, 60000);
