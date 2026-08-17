'use server'

import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { cookies, headers } from 'next/headers'
import { rateLimit } from '@/lib/ratelimit'
import crypto from 'crypto'

const COOKIE_NAME = 'auth_session'
const SECRET = process.env.SESSION_SECRET || 'parfume-session-secret-change-in-production'

function signSession(userId: string): string {
  const signature = crypto.createHmac('sha256', SECRET).update(userId).digest('hex')
  return `${userId}.${signature}`
}

function verifySession(raw: string): string | null {
  if (!raw || !raw.includes('.')) return null
  const [userId, signature] = raw.split('.')
  if (!userId || !signature) return null
  const expected = crypto.createHmac('sha256', SECRET).update(userId).digest('hex')
  // Timing-safe comparison to prevent timing attacks
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

function isRedirectError(error: unknown) {
  return (error as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT') || (error as { message?: string })?.message === 'NEXT_REDIRECT'
}

export async function login(prevState: { error?: string }, formData: FormData) {
  const headerStore = await headers()
  const ip = headerStore.get("x-forwarded-for") || "unknown"
  
  const limit = rateLimit(ip, 5, 60 * 1000)
  if (!limit.success) {
    return { error: 'Too many attempts. Please try again later.' }
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Please enter both email and password.' }
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (!user || !user.password) {
      return { error: 'Invalid credentials.' }
    }

    const passwordsMatch = await bcrypt.compare(password, user.password)
    if (!passwordsMatch) {
      return { error: 'Invalid credentials.' }
    }

    if (user.role !== 'ADMIN') {
      return { error: 'Access denied. Admin only.' }
    }

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, signSession(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7
    })

  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error('Login error:', error)
    return { error: 'Login failed. Please try again.' }
  }

  redirect('/admin/dashboard')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  redirect('/login')
}

export async function verifyAdmin() {
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get(COOKIE_NAME)?.value
    const userId = verifySession(raw || '')

    if (!userId) {
      redirect('/login')
    }

    const [user] = await db.select({ id: users.id, email: users.email, role: users.role, name: users.name }).from(users).where(eq(users.id, userId)).limit(1)

    if (!user || user.role !== 'ADMIN') {
      redirect('/login')
    }

    return user
  } catch (error) {
    if (isRedirectError(error)) throw error
    redirect('/login')
  }
}
