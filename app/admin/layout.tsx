import AdminShell from './AdminShell'
import { verifyAdmin } from '../actions/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await verifyAdmin()

  return <AdminShell>{children}</AdminShell>
}
