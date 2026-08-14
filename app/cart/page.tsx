import { db } from '@/lib/db'
import { settings, paymentMethods } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { CartClient } from './CartClient'

export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const settingsMap: Record<string, string> = {}
  let methods: { id: string; type: string; label: string; accountName: string | null; accountNumber: string | null; qrisImageUrl: string | null }[] = []

  try {
    const allSettings = await db.select().from(settings)
    for (const s of allSettings) {
      settingsMap[s.key] = s.value
    }

    const activeMethods = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.isActive, true))

    methods = activeMethods.map(m => ({
      id: m.id,
      type: m.type,
      label: m.label,
      accountName: m.accountName,
      accountNumber: m.accountNumber,
      qrisImageUrl: m.qrisImageUrl,
    }))
  } catch (error) {
    console.warn('Failed to fetch cart data:', error)
  }

  return <CartClient initialSettings={settingsMap} initialPaymentMethods={methods} />
}
