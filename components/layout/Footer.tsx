'use client'

import Link from 'next/link'
import { useStoreSettings } from '@/components/providers/StoreProvider'

export function Footer() {
  const { storeName, supportEmail, whatsapp, telegramUsername } = useStoreSettings()

  const waLink = whatsapp ? `https://wa.me/62${whatsapp.replace(/^0/, '')}` : '#'
  const tgLink = telegramUsername ? `https://t.me/${telegramUsername}` : '#'

  return (
    <footer className="border-t border-border bg-background text-muted-foreground mt-16 mb-14 md:mb-0">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-serif text-xl font-bold text-foreground mb-2">{storeName || 'Parfume Store'}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">Parfum branded original untukmu.</p>
          </div>

          {/* Kategori */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-foreground mb-3">Kategori</h4>
            <ul className="space-y-2">
              <li><Link href="/products?gender=Men" className="hover:text-foreground transition-colors">Pria</Link></li>
              <li><Link href="/products?gender=Women" className="hover:text-foreground transition-colors">Wanita</Link></li>
              <li><Link href="/products?gender=Unisex" className="hover:text-foreground transition-colors">Unisex</Link></li>
            </ul>
          </div>

          {/* Bantuan + Hubungi */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-foreground mb-3">Bantuan</h4>
            <ul className="space-y-2 mb-6">
              <li><Link href="/products" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link href="/products" className="hover:text-foreground transition-colors">Pengiriman</Link></li>
              <li><Link href="/products" className="hover:text-foreground transition-colors">Pengembalian</Link></li>
            </ul>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-foreground mb-3">Hubungi</h4>
            <ul className="space-y-2">
              {whatsapp && <li><a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">WhatsApp</a></li>}
              {telegramUsername && <li><a href={tgLink} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Telegram</a></li>}
              {supportEmail && <li><a href={`mailto:${supportEmail}`} className="hover:text-foreground transition-colors">Email</a></li>}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {storeName || 'Parfume Store'}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
