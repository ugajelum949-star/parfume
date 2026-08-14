import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';
import 'dotenv/config';

const globalForDb = global as unknown as { db: ReturnType<typeof drizzle> };

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { 
  prepare: false,
  max: process.env.NEXT_PHASE === 'phase-production-build' ? 1 : 5
});

export const db = globalForDb.db || drizzle(client, { schema });

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
