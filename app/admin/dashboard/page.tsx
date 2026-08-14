import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react'
import { db } from '@/lib/db'
import { orders, products, users } from '@/db/schema'
import { count, sql } from 'drizzle-orm'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [[orderCount], [revenue], [productCount], [userCount]] = await Promise.all([
    db.select({ value: count() }).from(orders),
    db.select({ value: sql<number>`coalesce(sum(${orders.total}), 0)` }).from(orders),
    db.select({ value: count() }).from(products),
    db.select({ value: count() }).from(users),
  ])

  const stats = [
    { title: 'Total Revenue', value: formatCurrency(revenue.value), icon: DollarSign },
    { title: 'Total Orders', value: String(orderCount.value), icon: ShoppingCart },
    { title: 'Products', value: String(productCount.value), icon: Package },
    { title: 'Users', value: String(userCount.value), icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm">Welcome to your store administration panel.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
