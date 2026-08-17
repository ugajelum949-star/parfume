import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()
  try {
    // Ping PostgreSQL
    await db.execute(sql`SELECT 1`)
    const latency = Date.now() - startTime

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      latencyMs: latency,
    }, { status: 200 })
  } catch (error) {
    const latency = Date.now() - startTime
    console.error('[health] Database check failed:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      latencyMs: latency,
      error: error instanceof Error ? error.message : 'Database ping failed',
    }, { status: 503 })
  }
}
