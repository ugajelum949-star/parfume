import { db } from './lib/db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const email = process.env.ADMIN_EMAIL || 'xxx@parfume.com';
    const password = process.env.ADMIN_PASSWORD || 'Jarwo828@Jr';

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
      } else if (existing.role !== 'ADMIN') {
        const hashed = await bcrypt.hash(password, 10);
        await db.update(users).set({ password: hashed, role: 'ADMIN', updatedAt: new Date() })
          .where(eq(users.id, existing.id));
        console.log('✅ Admin promoted to ADMIN');
      }
    } catch (err) {
      console.error('⚠️ Admin seed failed:', err);
    }
  }
}
