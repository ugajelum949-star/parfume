export function MarqueeBar() {
  const items = [
    'GRATIS ONGKIR untuk pembelian 2+ item',
    'GARANSI 100% ORIGINAL',
    'BAYAR DI TEMPAT tersedia',
    'FREE VIAL untuk setiap pembelian',
  ]
  const text = items.join(' · ')

  return (
    <div className="bg-card border-b border-border overflow-hidden">
      <div className="animate-marquee whitespace-nowrap py-3">
        <span className="text-xs uppercase tracking-widest text-muted-foreground inline-block">
          {text} · {text} · {text} ·
        </span>
      </div>
    </div>
  )
}
