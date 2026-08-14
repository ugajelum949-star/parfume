'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/features/cart/store'

export function BottomNav() {
  const pathname = usePathname()
  const items = useCartStore((s) => s.items)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  if (pathname.startsWith('/admin')) return null

  const navs = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/cart', label: 'Cart', icon: ShoppingBag, badge: totalItems },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-sidebar/95 backdrop-blur-xl border-t border-border">
      <div className="grid grid-cols-3 h-14">
        {navs.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors relative ${
                isActive ? 'text-gold' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {'badge' in item && item.badge! > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-accent text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
              {isActive && <span className="absolute top-0 w-8 h-[2px] bg-gold rounded-full" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
