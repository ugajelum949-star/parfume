'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, ShoppingBag, Search, Heart } from 'lucide-react'
import { useCartStore } from '@/features/cart/store'
import { useWishlistStore } from '@/features/wishlist/store'
import { useStoreSettings } from '@/components/providers/StoreProvider'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Produk' },
  { href: '/products?search=contact', label: 'Kontak' },
]

export function Header() {
  const items = useCartStore((s) => s.items)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const wishlistIds = useWishlistStore((s) => s.ids)
  const wishlistCount = wishlistIds.length
  const { storeName, storeLogo } = useStoreSettings()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100)
  }, [searchOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
      if (e.key === 'Escape') { setSearchOpen(false); setMobileOpen(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchOpen(false)
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href.split('?')[0])
  }

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border' : 'bg-background'}`}>
        <div className="container mx-auto flex items-center justify-between px-4 md:px-6 h-14 md:h-16">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              {storeLogo && <img src={storeLogo} alt={storeName} className="w-8 h-8 md:w-9 md:h-9 rounded-lg object-contain" />}
              <span className="text-lg md:text-xl font-bold tracking-tight">{storeName || 'Store'}</span>
            </Link>
          </div>

          {/* Center: nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className={`px-4 py-2 text-sm font-medium transition-colors ${isActive(item.href) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: icons */}
          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors" aria-label="Search">
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
            <Link href="/wishlist" className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors" aria-label="Wishlist">
              <Heart className="w-5 h-5 text-muted-foreground" />
              {wishlistCount > 0 && <span className="absolute top-1 right-1 text-[10px] bg-accent text-white rounded-full w-4 h-4 flex items-center justify-center">{wishlistCount}</span>}
            </Link>
            <Link href="/cart" className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors" aria-label="Cart">
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
              {totalItems > 0 && <span className="absolute top-1 right-1 text-[10px] bg-accent text-white rounded-full w-4 h-4 flex items-center justify-center">{totalItems}</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* Search modal */}
      {searchOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md transition-opacity" onClick={() => { setSearchOpen(false); setSearchQuery('') }} />
          <div className="fixed top-0 left-0 right-0 z-[61] p-4 md:pt-20 animate-in fade-in slide-in-from-top-4 duration-200">
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="relative bg-card border border-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input ref={searchInputRef} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari parfum..." className="w-full bg-transparent text-foreground pl-12 pr-24 py-4 text-lg outline-none placeholder:text-muted-foreground" />
                <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-accent px-2 py-1 rounded-md border border-border hover:text-foreground transition-colors">ESC</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-[50] bg-black/60 backdrop-blur-sm md:hidden transition-opacity" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 z-[50] bg-sidebar border-r border-border p-6 md:hidden animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <nav className="space-y-1">
              {NAV_LINKS.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive(item.href) ? 'text-foreground bg-accent' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}>
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-border my-3" />
              <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
              <Link href="/cart" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                Cart
              </Link>
              <div className="border-t border-border my-3" />
              <button onClick={() => { setMobileOpen(false); setSearchOpen(true) }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <Search className="w-4 h-4" /> Search
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  )
}
