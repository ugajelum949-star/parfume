'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { LayoutDashboard, Package, Settings, ArrowLeft, Menu, LogOut, ShoppingCart, CreditCard, Star, Image as ImageIcon, Swords, FileText, Sparkles } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { useStoreSettings } from '@/components/providers/StoreProvider'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/wars', label: 'Wars', icon: Swords },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/featured-brands', label: 'Homepage', icon: Sparkles },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/testimonials', label: 'Reviews', icon: Star },
  { href: '/admin/payment-methods', label: 'Payments', icon: CreditCard },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
              isActive
                ? "bg-gold/10 text-gold border border-gold/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        )
      })}

      <div className="pt-8 space-y-2">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Store
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </form>
      </div>
    </nav>
  )
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { storeName, storeLogo } = useStoreSettings()

  return (
    <div className="min-h-screen text-foreground flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border p-6 bg-sidebar">
        <div className="flex items-center gap-2 mb-8">
          {storeLogo ? (
            <img src={storeLogo} alt={storeName} className="w-8 h-8 rounded-lg object-contain" />
          ) : (
            <span className="bg-accent text-white px-2 py-1 rounded font-bold text-sm">
              {storeName?.charAt(0) || 'A'}
            </span>
          )}
          <div>
            <span className="font-bold text-sm block leading-tight">{storeName || 'Admin'}</span>
            <span className="text-xs text-muted-foreground">Panel</span>
          </div>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-sidebar">
          <div className="flex items-center gap-2">
            {storeLogo ? (
              <img src={storeLogo} alt={storeName} className="w-6 h-6 rounded object-contain" />
            ) : (
              <span className="bg-accent text-white px-2 py-1 rounded font-bold text-xs">
                {storeName?.charAt(0) || 'A'}
              </span>
            )}
            <span className="font-bold text-base">{storeName || 'Admin'}</span>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-sidebar border-border text-foreground w-72 p-6">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-foreground flex items-center gap-2">
                  {storeLogo ? (
                    <img src={storeLogo} alt={storeName} className="w-6 h-6 rounded object-contain" />
                  ) : (
                    <span className="bg-accent text-white px-2 py-1 rounded font-bold text-xs">
                      {storeName?.charAt(0) || 'A'}
                    </span>
                  )}
                  <span>{storeName || 'Admin'} Menu</span>
                </SheetTitle>
              </SheetHeader>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
