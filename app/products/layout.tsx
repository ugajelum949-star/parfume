import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Katalog Lengkap Parfum Original — Mykonos, Velixir, Afnan & Desainer',
  description: 'Jelajahi ratusan koleksi parfum original: brand lokal viral (Mykonos, Velixir, HMNS, SAFF & Co), parfum Arabian (Afnan, Lattafa, Armaf, Al Haramain), serta desainer ternama (Dior, Chanel, YSL, Tom Ford). Filter berdasarkan Scent Family: Fresh, Floral, Woody, Amber dan Gender: Men, Women, Unisex.',
  keywords: [
    'katalog parfum original', 'daftar harga parfum original', 'parfum mykonos lengkap', 'parfum velixir original', 'parfum afnan terlengkap', 'parfum lattafa murah', 'parfum pria original', 'parfum wanita tahan lama', 'parfum unisex', 'fresh scent perfume', 'floral scent perfume', 'woody scent perfume', 'amber scent perfume', 'decant parfum murah'
  ],
  openGraph: {
    title: 'Katalog Lengkap Parfum Original — Mykonos, Velixir, Afnan & Desainer',
    description: 'Koleksi lengkap parfum original: Mykonos, Velixir, Afnan, Lattafa, Dior, Chanel, Tom Ford, Creed & lebih. Jaminan 100% Authentic & Gratis Ongkir.',
    type: 'website',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL!}/products`,
  },
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
