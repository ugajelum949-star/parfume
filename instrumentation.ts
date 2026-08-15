import { db } from './lib/db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD

    if (!email || !password) {
      console.warn('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed')
      return
    }

    try {
      const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (!existing) {
        const hashed = await bcrypt.hash(password, 10);
        await db.insert(users).values({
          email,
          password: hashed,
          name: 'System Admin',
          role: 'ADMIN'
        });
        console.log('✅ Admin seeded');
      }
    } catch (err) {
      console.error('⚠️ Admin seed failed:', err);
    }
  }
}
