'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { X, ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { parseAllSizePrices, getPostWarPrice } from '@/lib/price'
import { getProducts } from '@/app/actions/products'
import { useCompareStore } from '@/features/compare/store'
import toast from 'react-hot-toast'

type Product = {
  id: string
  name: string
  category: string
  brand: string
  gender: string
  price: number
  description: string | null
  image: string | null
  sizes: string
  stockData: string
  stock: number
  tags: string
  isBestSeller: boolean
  warPrice?: number | null
  launchedAt?: Date | string | null
}

function CompareContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const idsParam = searchParams.get('ids') || ''
  const ids = idsParam.split(',').filter(Boolean)
  const remove = useCompareStore((s) => s.remove)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ids.length < 2) {
      toast.error('Pilih minimal 2 produk untuk dibandingkan')
      router.replace('/products')
      return
    }

    getProducts().then((data) => {
      const all = data as Product[]
      const filtered = all.filter((p) => ids.includes(p.id))
      setProducts(filtered)
      setLoading(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemove = (id: string) => {
    remove(id)
    const remaining = ids.filter((i) => i !== id)
    if (remaining.length < 2) {
      toast.error('Pilih minimal 2 produk untuk dibandingkan')
      router.replace('/products')
    } else {
      router.replace(`/compare?ids=${remaining.join(',')}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const fields: { label: string; render: (p: Product) => React.ReactNode }[] = [
    {
      label: 'Gambar',
      render: (p) => (
        <div className="relative aspect-[3/4] bg-gold/5 rounded-lg overflow-hidden mx-auto max-w-[200px]">
          {p.image ? (
            <Image src={p.image} alt={p.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              No Image
            </div>
          )}
        </div>
      ),
    },
    { label: 'Nama', render: (p) => <span className="font-semibold text-sm">{p.name}</span> },
    { label: 'Merek', render: (p) => <span className="text-sm">{p.brand}</span> },
    {
      label: 'Harga',
      render: (p) => {
        const postWar = getPostWarPrice(p.warPrice, p.launchedAt)
        if (postWar) {
          return <span className="text-red-500 font-bold">{formatCurrency(postWar)}</span>
        }
        const { sizePrices, sizeSalePrices } = parseAllSizePrices(p.stockData, p.sizes, p.price)
        return (
          <div className="space-y-1">
            {Object.entries(sizePrices).map(([size, price]) => (
              <div key={size} className="text-xs">
                <span className="text-muted-foreground">{size}: </span>
                {sizeSalePrices[size] && sizeSalePrices[size] < price ? (
                  <>
                    <span className="line-through text-muted-foreground">{formatCurrency(price)}</span>
                    <span className="text-gold font-bold ml-1">{formatCurrency(sizeSalePrices[size])}</span>
                  </>
                ) : (
                  <span className="font-medium">{formatCurrency(price)}</span>
                )}
              </div>
            ))}
          </div>
        )
      },
    },
    { label: 'Scent Family', render: (p) => <span className="text-sm">{p.category}</span> },
    { label: 'Gender', render: (p) => <span className="text-sm">{p.gender}</span> },
    {
      label: 'Deskripsi',
      render: (p) => <span className="text-xs text-muted-foreground leading-relaxed">{p.description || '-'}</span>,
    },
    {
      label: 'Stok',
      render: (p) => (
        <span className={`text-sm font-medium ${p.stock <= 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-500' : 'text-green-600'}`}>
          {p.stock <= 0 ? 'Habis' : `Sisa ${p.stock}`}
        </span>
      ),
    },
    {
      label: 'Tags',
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.tags ? p.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
            <span key={tag} className="text-[10px] bg-accent text-muted-foreground px-1.5 py-0.5 rounded-full">{tag}</span>
          )) : <span className="text-xs text-muted-foreground">-</span>}
        </div>
      ),
    },
    {
      label: 'Best Seller',
      render: (p) => p.isBestSeller ? (
        <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full font-bold">★ Best Seller</span>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="container mx-auto px-4 py-6 md:py-10 space-y-6">
        {/* Back button */}
        <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Products
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">Bandingkan Produk</h1>
          <span className="text-sm text-muted-foreground">{products.length} produk</span>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="w-[140px] md:w-[180px] p-3 text-left text-sm font-medium text-muted-foreground border-b border-border" />
                {products.map((p) => (
                  <th key={p.id} className="p-3 text-center border-b border-border min-w-[200px]">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => handleRemove(p.id)}
                        className="self-end w-6 h-6 rounded-full bg-accent hover:bg-red-500/20 flex items-center justify-center transition-colors"
                        aria-label={`Hapus ${p.name} dari perbandingan`}
                      >
                        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                      </button>
                      <span className="font-semibold text-sm line-clamp-2">{p.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.label} className="border-b border-border last:border-0">
                  <td className="p-3 text-sm font-medium text-muted-foreground align-top">{field.label}</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-3 align-top">
                      <div className="flex justify-center">{field.render(p)}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-3 pt-4">
          <Button asChild variant="outline" className="border-border">
            <Link href="/products">Tambah Produk Lain</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CompareContent />
    </Suspense>
  )
}
