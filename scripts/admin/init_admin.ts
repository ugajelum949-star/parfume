import 'dotenv/config';
import { db } from '../../lib/db';
import { users } from '../../db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function initAdmin() {
  const email = process.env.ADMIN_EMAIL || 'xxx@parfume.com';
  const rawPassword = process.env.ADMIN_PASSWORD || 'Jarwo828@Jr';

  console.log(`Checking existing admin user: ${email}...`);

  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  if (existingUser) {
    console.log('Updating password for existing admin...');
    await db.update(users).set({
      password: hashedPassword,
      role: 'ADMIN',
      updatedAt: new Date()
    }).where(eq(users.id, existingUser.id));
    console.log('✅ Admin account updated successfully!');
  } else {
    console.log('Creating new admin account...');
    await db.insert(users).values({
      email,
      password: hashedPassword,
      name: 'System Admin',
      role: 'ADMIN'
    });
    console.log('✅ Admin account created successfully!');
  }

  process.exit(0);
}

initAdmin().catch((err) => {
  console.error('❌ Failed to initialize admin:', err);
  process.exit(1);
});
