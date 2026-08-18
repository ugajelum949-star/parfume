'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, X, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import {
  getFeaturedBrands,
  createFeaturedBrand,
  updateFeaturedBrand,
  deleteFeaturedBrand,
  toggleFeaturedBrand,
  getAllProductsForPicker,
} from '@/app/actions/featured-brands'
import { getGenderSlots, saveGenderSlots } from '@/app/actions/settings'
import { BRANDS } from '@/lib/config'
import { getImageSrc } from '@/lib/image-proxy'

interface FeaturedBrand {
  id: string
  brand: string
  order: number
  active: boolean
  createdAt: Date | null
}

interface Product {
  id: string
  name: string
  brand: string
  gender: string
  image: string | null
}

interface GenderSlots {
  Men: string[]
  Women: string[]
  Unisex: string[]
}

export default function AdminFeaturedBrandsPage() {
  // Featured Brands state
  const [brands, setBrands] = useState<FeaturedBrand[]>([])
  const [brandForm, setBrandForm] = useState({ brand: '', order: '0' })
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null)
  const [showBrandForm, setShowBrandForm] = useState(false)
  const [savingBrand, setSavingBrand] = useState(false)

  // Gender Slots state
  const [genderSlots, setGenderSlots] = useState<GenderSlots>({ Men: [], Women: [], Unisex: [] })
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [savingSlots, setSavingSlots] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSlot, setActiveSlot] = useState<{ category: 'Men' | 'Women' | 'Unisex'; index: number } | null>(null)

  // Load data
  useEffect(() => {
    async function init() {
      const [brandsData, slotsData, productsData] = await Promise.all([
        getFeaturedBrands(),
        getGenderSlots(),
        getAllProductsForPicker(),
      ])
      setBrands(brandsData as FeaturedBrand[])
      setGenderSlots(slotsData as GenderSlots)
      setAllProducts(productsData as Product[])
    }
    init()
  }, [])

  const loadBrands = async () => {
    const data = await getFeaturedBrands()
    setBrands(data as FeaturedBrand[])
  }

  // Featured Brands handlers
  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brandForm.brand) { toast.error('Brand wajib diisi'); return }
    setSavingBrand(true)
    try {
      const fd = new FormData()
      fd.set('brand', brandForm.brand)
      fd.set('order', brandForm.order)

      if (editingBrandId) {
        const result = await updateFeaturedBrand(editingBrandId, fd)
        if (result.success) {
          toast.success('Brand updated')
        } else {
          toast.error(result.error || 'Failed')
        }
      } else {
        const result = await createFeaturedBrand(fd)
        if (result.success) {
          toast.success('Brand added')
        } else {
          toast.error(result.error || 'Failed')
        }
      }
      setBrandForm({ brand: '', order: '0' })
      setEditingBrandId(null)
      setShowBrandForm(false)
      await loadBrands()
    } catch {
      toast.error('Failed to save')
    }
    setSavingBrand(false)
  }

  const handleEditBrand = (b: FeaturedBrand) => {
    setBrandForm({ brand: b.brand, order: String(b.order) })
    setEditingBrandId(b.id)
    setShowBrandForm(true)
  }

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Hapus brand ini?')) return
    await deleteFeaturedBrand(id)
    toast.success('Deleted')
    await loadBrands()
  }

  const handleToggleBrand = async (id: string, active: boolean) => {
    const result = await toggleFeaturedBrand(id, active)
    if (!result.success) {
      toast.error(result.error || 'Failed')
    }
    await loadBrands()
  }

  // Gender Slots handlers
  const handleSlotChange = (category: 'Men' | 'Women' | 'Unisex', index: number, productId: string) => {
    setGenderSlots(prev => {
      const newSlots = { ...prev }
      const arr = [...newSlots[category]]
      arr[index] = productId
      newSlots[category] = arr
      return newSlots
    })
    setActiveSlot(null)
    setSearchQuery('')
  }

  const handleRemoveSlot = (category: 'Men' | 'Women' | 'Unisex', index: number) => {
    setGenderSlots(prev => {
      const newSlots = { ...prev }
      const arr = [...newSlots[category]]
      arr[index] = ''
      newSlots[category] = arr
      return newSlots
    })
  }

  const handleSaveSlots = async () => {
    setSavingSlots(true)
    const result = await saveGenderSlots(genderSlots)
    if (result.success) {
      toast.success('Kurasi slot gender tersimpan')
    } else {
      toast.error(result.error || 'Failed')
    }
    setSavingSlots(false)
  }

  const getFilteredProducts = (category: 'Men' | 'Women' | 'Unisex') => {
    const query = searchQuery.toLowerCase()
    return allProducts.filter(p => {
      if (category === 'Men' && p.gender !== 'Men' && p.gender !== 'Unisex') return false
      if (category === 'Women' && p.gender !== 'Women' && p.gender !== 'Unisex') return false
      if (category === 'Unisex' && p.gender !== 'Unisex') return false
      if (query && !p.name.toLowerCase().includes(query) && !p.brand.toLowerCase().includes(query)) return false
      return true
    }).slice(0, 20)
  }

  const activeCount = brands.filter(b => b.active).length

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Homepage Curation</h1>

      {/* Section A: Featured Brands */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>5-Brand Showcase Slider</CardTitle>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${activeCount >= 5 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {activeCount} / 5
            </span>
          </div>
          <Button
            onClick={() => { setBrandForm({ brand: '', order: '0' }); setEditingBrandId(null); setShowBrandForm(true) }}
            className="bg-accent text-white hover:bg-gold-light"
            disabled={activeCount >= 5}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Brand
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showBrandForm && (
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <form onSubmit={handleBrandSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Brand</Label>
                    <select
                      value={brandForm.brand}
                      onChange={e => setBrandForm(f => ({ ...f, brand: e.target.value }))}
                      className="w-full border border-border rounded-md px-3 py-2 bg-background text-foreground text-sm"
                    >
                      <option value="">Pilih brand...</option>
                      {BRANDS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Urutan (0-4)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="4"
                      value={brandForm.order}
                      onChange={e => setBrandForm(f => ({ ...f, order: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={savingBrand} className="bg-accent text-white hover:bg-gold-light">
                    {savingBrand ? 'Saving...' : editingBrandId ? 'Update' : 'Add'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { setShowBrandForm(false); setEditingBrandId(null) }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {brands.map((b) => (
            <div key={b.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 border border-border">
              <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                {b.order}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{b.brand}</p>
              </div>
              <button
                onClick={() => handleToggleBrand(b.id, !b.active)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${b.active ? 'bg-green-600/20 text-green-400' : 'bg-muted text-muted-foreground'}`}
              >
                {b.active ? 'Active' : 'Inactive'}
              </button>
              <Button variant="ghost" size="icon" onClick={() => handleEditBrand(b)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteBrand(b.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}

          {brands.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Belum ada featured brand.</p>
          )}
        </CardContent>
      </Card>

      {/* Section B: Gender Curated Slots */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Kurasi Slot Gender</CardTitle>
          <Button onClick={handleSaveSlots} disabled={savingSlots} className="bg-accent text-white hover:bg-gold-light">
            {savingSlots ? 'Saving...' : 'Simpan Kurasi'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {(['Men', 'Women', 'Unisex'] as const).map(category => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm">
                  For {category === 'Men' ? 'Him' : category === 'Women' ? 'Her' : 'Everyone'}
                </h3>
                <span className="text-xs text-muted-foreground">
                  ({genderSlots[category].filter(Boolean).length}/4 slot terisi)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map(idx => {
                  const productId = genderSlots[category][idx]
                  const product = allProducts.find(p => p.id === productId)
                  return (
                    <div key={idx} className="relative">
                      <div className="text-xs text-muted-foreground mb-1">Slot {idx + 1}</div>
                      {product ? (
                        <div className="p-2 bg-muted/30 rounded-lg border border-border">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveSlot(category, idx)}
                              className="text-destructive hover:text-destructive/80 shrink-0"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveSlot({ category, index: idx })}
                          className="w-full p-2 border border-dashed border-border rounded-lg text-xs text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                        >
                          + Pilih Produk
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Product Picker Modal */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setActiveSlot(null)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">
                Pilih Produk For {activeSlot.category === 'Men' ? 'Him' : activeSlot.category === 'Women' ? 'Her' : 'Everyone'} — Slot {activeSlot.index + 1}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => { setActiveSlot(null); setSearchQuery('') }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <Input
                placeholder="Cari nama atau brand..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
              {getFilteredProducts(activeSlot.category).map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSlotChange(activeSlot.category, activeSlot.index, p.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  {p.image ? (
                    <img src={getImageSrc(p.image)} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-muted shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand} · {p.gender}</p>
                  </div>
                </button>
              ))}
              {getFilteredProducts(activeSlot.category).length === 0 && (
                <p className="text-center text-muted-foreground py-4 text-sm">Tidak ada produk ditemukan.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
