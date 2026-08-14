import 'dotenv/config'
import { db } from '../lib/db'
import { settings } from '../db/schema'
import { eq } from 'drizzle-orm'

const defaults: Record<string, string> = {
  shipping_free_threshold: '300000',
  shipping_customization_fee: '25000',
  shipping_transfer_discount: '50000',
  shipping_instant_price: '45000',
  shipping_nextday_surcharge: '20000',
  promo_qty_bundle: '3',
  promo_qty_mega: '5',
}

async function main() {
  for (const [key, value] of Object.entries(defaults)) {
    const [existing] = await db.select().from(settings).where(eq(settings.key, key)).limit(1)
    if (existing) {
      await db.update(settings).set({ value }).where(eq(settings.key, key))
    } else {
      await db.insert(settings).values({ key, value })
    }
    process.stdout.write(`${key} = ${value}\n`)
  }
  process.stdout.write('Done\n')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
