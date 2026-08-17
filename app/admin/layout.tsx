import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'
import AdminShell from './AdminShell'

const COOKIE_NAME = 'auth_session'
const SECRET = process.env.SESSION_SECRET || 'parfume-session-secret-change-in-production'

function verifySession(raw: string): string | null {
  if (!raw || !raw.includes('.')) return null
  const [userId, signature] = raw.split('.')
  if (!userId || !signature) return null
  const expected = crypto.createHmac('sha256', SECRET).update(userId).digest('hex')
  try {
    const sigBuf = Buffer.from(signature, 'hex')
    const expBuf = Buffer.from(expected, 'hex')
    if (sigBuf.length !== expBuf.length) return null
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null
  } catch {
    return null
  }
  return userId
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  const userId = verifySession(raw || '')

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
