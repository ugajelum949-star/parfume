import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { ProtectionProvider } from "@/components/providers/ProtectionProvider";
import { ClientOverlays } from "@/components/shared/ClientOverlays";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { FloatingChat } from "@/components/shared/FloatingChat";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: 'Parfume Store Indonesia',
  url: baseUrl,
  logo: `${baseUrl}/img.png`,
  description: 'Toko parfum online terpercaya di Indonesia. Menyediakan parfum original dari brand lokal viral (Mykonos, Velixir, HMNS, SAFF & Co), Arabian / Middle Eastern (Afnan, Lattafa, Armaf, Al Haramain), hingga desainer internasional (Dior, Chanel, Tom Ford, YSL).',
  currenciesAccepted: 'IDR',
  paymentAccepted: 'QRIS, Bank Transfer',
  areaServed: {
    '@type': 'Country',
    name: 'Indonesia',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['Indonesian', 'English'],
  },
}

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Parfume Store — Toko Parfum Original, Decant & Brand Viral Terlengkap',
    template: '%s | Parfume Store'
  },
  description: 'Pusat parfum original & decant terlengkap di Indonesia. Temukan koleksi parfum viral lokal (Mykonos, Velixir, HMNS, Saff & Co, Kahf), parfum Timur Tengah / Arabian (Afnan, Lattafa, Armaf, Al Haramain), hingga desainer internasional (Dior, Chanel, Tom Ford, Creed, YSL). Jaminan 100% Authentic, gratis ongkir & garansi pengiriman aman.',
  keywords: [
    // Brand Lokal Viral
    'parfum Mykonos original', 'parfum Velixir', 'HMNS perfume', 'SAFF & Co original', 'Kahf eau de parfum', 'Alchemist Fragrance', 'Onix Fragrance', 'Lilith and Eve', 'Project 1945', 'Crusita', 'Heura',
    // Brand Timur Tengah / Arabian Clones
    'parfum Afnan', 'parfum Lattafa original', 'Armaf Club de Nuit', 'Al Haramain Amber Oud', 'Maison Alhambra', 'parfum Rasasi', 'Swiss Arabian', 'parfum arab murah tahan lama',
    // Desainer & Luxury Niche
    'parfum Dior Sauvage', 'Chanel Bleu de Chanel', 'Tom Ford perfume', 'Creed Aventus original', 'YSL Libre', 'YSL Black Opium', 'Bvlgari Aqua', 'Versace Eros', 'Jean Paul Gaultier Le Male', 'Maison Francis Kurkdjian Baccarat', 'Jo Malone', 'Le Labo Santal 33',
    // Kategori & Istilah Umum
    'toko parfum original', 'jual parfum online terpercaya', 'decant parfum original', 'vial parfum', 'sample parfum', 'parfum pria tahan lama', 'parfum wanita wangi mewah', 'parfum unisex', 'parfum extrait de parfum', 'parfum eau de parfum', 'scent family fresh floral woody amber', 'gratis ongkir parfum indonesia'
  ],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Parfume Store Indonesia',
    title: 'Parfume Store — Toko Parfum Original, Decant & Brand Viral Terlengkap',
    description: 'Beli parfum original bergaransi: Mykonos, Velixir, Afnan, Lattafa, Dior, Chanel, Tom Ford & ratusan parfum lainnya. 100% Original, pengiriman cepat & gratis ongkir seluruh Indonesia.',
    images: [
      {
        url: '/img.png',
        width: 1200,
        height: 630,
        alt: 'Parfume Store — Toko Parfum Original Terlengkap',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parfume Store — Toko Parfum Original, Decant & Brand Viral Terlengkap',
    description: 'Beli parfum original bergaransi: Mykonos, Velixir, Afnan, Lattafa, Dior, Chanel, Tom Ford & ratusan parfum lainnya. 100% Original & Gratis Ongkir.',
    images: ['/img.png'],
  },
  icons: {
    icon: '/img.png',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://is3.cloudhost.id" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${dmSerif.variable} antialiased`}>
        <StoreProvider>
          <ProtectionProvider />
          <div className="flex flex-col min-h-screen bg-background text-foreground">
            <main className="flex-1">{children}</main>
            <Footer />
            <BottomNav />
            <ClientOverlays />
            <ScrollToTop />
            <FloatingChat />
          </div>
          <Toaster position="top-center" />
        </StoreProvider>
      </body>
    </html>
  );
}
