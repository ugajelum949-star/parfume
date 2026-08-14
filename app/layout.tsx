import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { ProtectionProvider } from "@/components/providers/ProtectionProvider";
import { ClientOverlays } from "@/components/shared/ClientOverlays";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
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
  '@type': 'Organization',
  name: 'Parfume Store',
  url: baseUrl,
  logo: `${baseUrl}/img.png`,
  description: 'Toko parfum branded original Indonesia',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'Indonesian',
  },
}

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Parfume Store — Parfum Original',
    template: '%s | Parfume Store'
  },
  description: 'Parfum branded original. Dior, Chanel, Tom Ford & lebih. Gratis ongkir untuk 2+ item.',
  keywords: ['parfum', 'perfume', 'parfum original', 'parfum branded', 'Dior Sauvage', 'Chanel', 'Tom Ford', 'Creed Aventus', 'parfum murah', 'parfum pria', 'parfum wanita'],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Parfume Store',
    title: 'Parfume Store — Parfum Original',
    description: 'Parfum branded original. Dior, Chanel, Tom Ford & lebih. Gratis ongkir untuk pembelian di atas Rp300.000.',
    images: [
      {
        url: '/img.png',
        width: 1200,
        height: 630,
        alt: 'Parfume Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parfume Store — Parfum Original',
    description: 'Parfum branded original. Dior, Chanel, Tom Ford & lebih.',
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
          </div>
          <Toaster position="top-center" />
        </StoreProvider>
      </body>
    </html>
  );
}
