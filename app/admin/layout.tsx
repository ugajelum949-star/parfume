import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import AdminShell from './AdminShell'

const COOKIE_NAME = 'auth_session'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const userId = cookieStore.get(COOKIE_NAME)?.value

  if (!userId) {
    redirect('/login')
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

    if (!user || user.role !== 'ADMIN') {
      redirect('/login')
    }
  } catch {
    redirect('/login')
  }

  return <AdminShell>{children}</AdminShell>
}
