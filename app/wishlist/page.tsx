import { WishlistContent } from '@/components/wishlist/WishlistContent'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Wishlist',
  description: 'Produk favorit Anda',
}

export default function WishlistPage() {
  return <WishlistContent />
}
