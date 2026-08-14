import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Katalog Parfum Original — Semua Scent Family',
  description: 'Temukan parfum branded original: Fresh untuk kesegaran, Floral untuk keeleganan, Woody untuk kehangatan, Amber untuk kesensualan. Gratis ongkir untuk pembelian di atas Rp300.000.',
  keywords: ['parfum original', 'parfum branded', 'katalog parfum', 'parfum Dior', 'parfum Chanel', 'parfum Tom Ford', 'parfum Creed'],
  openGraph: {
    title: 'Katalog Parfum Original — Parfume Store',
    description: 'Dior, Chanel, Tom Ford, Creed & lebih. Gratis ongkir untuk pembelian di atas Rp300.000.',
    type: 'website',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL!}/products`,
  },
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
