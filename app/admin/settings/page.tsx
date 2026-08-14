import { db } from '@/lib/db'
import { settings } from '@/db/schema'
import { SettingsForm } from './settings-form'

export default async function AdminSettingsPage() {
  const rows = await db.select().from(settings)
  const map: Record<string, string> = {}
  for (const row of rows) {
    map[row.key] = row.value
  }

  return <SettingsForm initial={map} />
}
