import Link from 'next/link'
import { Header } from '@/components/layout/Header'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <h1 className="text-8xl font-black text-foreground/20 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">The page you are looking for might have been removed or is temporarily unavailable.</p>
        <Link href="/" className="px-6 py-3 bg-gold hover:bg-gold-light font-bold rounded-xl transition-colors">
          Return Home
        </Link>
      </main>
    </div>
  )
}
