'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Package, Trash2, Loader2, Image as ImageIcon, Pencil } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { getProducts, createProduct, deleteProduct, updateProduct } from '@/app/actions/products'
import { uploadImage } from '@/app/actions/upload'
import { compressImage, fileToBase64 } from '@/lib/compression'
import { SCENT_FAMILIES, GENDERS, BRANDS } from '@/lib/config'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

type Product = {
  id: string
  name: string
  category: string
  brand: string
  gender: string
  price: number
  image: string | null
  sizes: string
  stock: number
  isBestSeller: boolean
  isFeatured?: boolean
  stockData?: string
  description?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('Other')
  const [category, setCategory] = useState<string>(SCENT_FAMILIES[0])
  const [gender, setGender] = useState('Unisex')
  const [, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [sizes, setSizes] = useState('100ml,150ml')
  const [sizePrices, setSizePrices] = useState<Record<string, string>>({})
  const [sizeSalePrices, setSizeSalePrices] = useState<Record<string, string>>({})
  const [stock, setStock] = useState('20')
  const [isBestSeller, setIsBestSeller] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [extraImages, setExtraImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    getProducts().then((data) => setProducts(data as Product[]))
  }, [])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const rawFile = e.target.files?.[0]
    if (!rawFile) return
    setUploading(true)
    try {
      const compressedFile = await compressImage(rawFile, 0.85, 1920)
      const base64 = await fileToBase64(compressedFile)
      const result = await uploadImage(base64, 'products')
      if (result.success && result.url) {
        setImageUrl(result.url)
        toast.success('Foto berhasil diunggah')
      } else {
        toast.error(result.error || 'Gagal mengunggah foto')
      }
    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Gagal memproses gambar: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setUploading(false)
    }
  }

  async function handleExtraImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const rawFile = e.target.files?.[0]
    if (!rawFile || extraImages.length >= 4) return
    setUploading(true)
    try {
      const compressedFile = await compressImage(rawFile, 0.85, 1920)
      const base64 = await fileToBase64(compressedFile)
      const result = await uploadImage(base64, 'products')
      if (result.success && result.url) {
        setExtraImages(prev => [...prev, result.url!])
        toast.success('Foto berhasil diunggah')
      } else {
        toast.error(result.error || 'Gagal mengunggah foto')
      }
    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Gagal memproses gambar: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setUploading(false)
    }
  }

  function removeExtraImage(index: number) {
    setExtraImages(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('name', name)
    fd.set('brand', brand)
    fd.set('category', category)
    fd.set('gender', gender)
    fd.set('price', Object.values(sizePrices)[0] || '0')
    fd.set('description', description)
    fd.set('sizes', sizes)
    const sizesList = sizes.split(',').filter(s => s.trim()).map(s => s.trim()).filter((v, i, a) => a.indexOf(v) === i)
    const pricesMap: Record<string, string> = {}
    sizesList.forEach(s => { pricesMap[s] = sizePrices[s] || '0' })
    fd.set('sizePrices', JSON.stringify(pricesMap))
    const salePricesMap: Record<string, string> = {}
    sizesList.forEach(s => { if (sizeSalePrices[s]) salePricesMap[s] = sizeSalePrices[s] })
    fd.set('sizeSalePrices', JSON.stringify(salePricesMap))
    fd.set('stock', stock)
    fd.set('isBestSeller', String(isBestSeller))
    fd.set('isFeatured', String(isFeatured))
    if (imageUrl) fd.set('image', imageUrl)
    extraImages.forEach(url => fd.append('images', url))

    let result
    if (editingId) {
      result = await updateProduct(editingId, fd)
    } else {
      result = await createProduct(fd)
    }

    if (result.success) {
      toast.success(editingId ? 'Product updated' : 'Product added')
      setShowForm(false)
      setEditingId(null)
      resetForm()
      getProducts().then((data) => setProducts(data as Product[]))
    } else {
      toast.error(result.error || 'Failed')
    }
  }

  function handleEdit(product: Product) {
    setEditingId(product.id)
    setName(product.name)
    setBrand(product.brand)
    setCategory(product.category)
    setGender(product.gender)
    setPrice(String(product.price))
    setDescription(product.description || '')
    setSizes(product.sizes || '100ml,150ml')
    setStock(String(product.stock))
    setIsBestSeller(product.isBestSeller)
    setIsFeatured(product.isFeatured || false)
    setImageUrl(product.image || '')
    // Parse size prices from stockData
    try {
      const sd = JSON.parse(product.stockData || '{}')
      if (sd.prices) {
        const sp: Record<string, string> = {}
        Object.entries(sd.prices).forEach(([k, v]) => { sp[k] = String(v) })
        setSizePrices(sp)
      } else {
        const sp: Record<string, string> = {}
        ;(product.sizes || '').split(',').forEach((s: string) => { sp[s.trim()] = String(product.price) })
        setSizePrices(sp)
      }
      // Parse sale prices
      if (sd.salePrices) {
        const ssp: Record<string, string> = {}
        Object.entries(sd.salePrices).forEach(([k, v]) => { ssp[k] = String(v) })
        setSizeSalePrices(ssp)
      } else {
        setSizeSalePrices({})
      }
    } catch {
      const sp: Record<string, string> = {}
      ;(product.sizes || '').split(',').forEach((s: string) => { sp[s.trim()] = String(product.price) })
      setSizePrices(sp)
      setSizeSalePrices({})
    }
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return
    const result = await deleteProduct(id)
    if (result.success) {
      toast.success('Deleted')
      setProducts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  function resetForm() {
    setName(''); setBrand('Other'); setCategory(SCENT_FAMILIES[0]); setGender('Unisex')
    setPrice(''); setDescription(''); setSizes('100ml,150ml')
    setStock('20'); setIsBestSeller(false); setIsFeatured(false); setImageUrl('')
    setExtraImages([]); setSizePrices({}); setSizeSalePrices({})
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm">{products.length} products in catalog</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); if (showForm) resetForm() }} className="bg-accent hover:bg-accent-hover text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> {showForm ? 'Cancel' : 'Add Product'}
        </Button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{editingId ? 'Edit Product' : 'Add New Product'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Name *</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sauvage" required className="bg-input border-border text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Brand</Label>
                  <Input
                    list="brand-suggestions"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    placeholder="e.g. Mykonos, Velixir, Afnan, Dior"
                    className="bg-input border-border text-sm"
                  />
                  <datalist id="brand-suggestions">
                    {BRANDS.map(b => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Scent Family *</Label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                    {SCENT_FAMILIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Gender</Label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Stock</Label>
                  <Input type="number" value={stock} onChange={e => setStock(e.target.value)} className="bg-input border-border text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Sizes (comma separated)</Label>
                  <Input value={sizes} onChange={e => {
                    const newSizes = e.target.value
                    setSizes(newSizes)
                    const newPrices = { ...sizePrices }
                    newSizes.split(',').forEach(s => {
                      const size = s.trim()
                      if (size && !newPrices[size]) newPrices[size] = ''
                    })
                    setSizePrices(newPrices)
                  }} placeholder="100ml,150ml" className="bg-input border-border text-sm" />
                </div>
                {/* Per-size prices in a compact grid */}
                {sizes.split(',').filter(s => s.trim()).map(s => s.trim()).filter((v, i, a) => a.indexOf(v) === i).length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Harga & Diskon per Size (IDR)</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {sizes.split(',').filter(s => s.trim()).map(s => s.trim()).filter((v, i, a) => a.indexOf(v) === i).map(size => (
                        <div key={size} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-14 shrink-0">{size}</span>
                          <Input type="number" value={sizePrices[size] || ''} onChange={e => setSizePrices(prev => ({ ...prev, [size]: e.target.value }))} placeholder="Harga" className="bg-input border-border text-sm" />
                          <Input type="number" value={sizeSalePrices[size] || ''} onChange={e => setSizeSalePrices(prev => ({ ...prev, [size]: e.target.value }))} placeholder="Diskon" className="bg-input border-border text-sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Main Image</Label>
                  <div className="flex gap-2">
                    <Label className="flex-1 cursor-pointer">
                      <span className="flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 px-3 py-2 rounded-lg border border-border text-sm transition-colors">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                        {imageUrl ? 'Uploaded' : 'Upload'}
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </Label>
                  </div>
                </div>
              </div>
              {/* Additional Images (max 4 more) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Additional Images (max 4 more)</Label>
                <div className="flex flex-wrap gap-2">
                  {extraImages.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeExtraImage(i)} className="absolute top-0 right-0 w-5 h-5 bg-destructive text-white rounded-bl-lg flex items-center justify-center text-xs">×</button>
                    </div>
                  ))}
                  {extraImages.length < 4 && (
                    <Label className="w-16 h-16 rounded-lg border border-dashed border-border flex items-center justify-center cursor-pointer hover:border-gold/50 transition-colors">
                      <span className="text-muted-foreground text-xs">+</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleExtraImageUpload} disabled={uploading} />
                    </Label>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">Total: 1 main + {extraImages.length} extra = {1 + extraImages.length} images</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Description</Label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none" placeholder="Fragrance description..." />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="bestSeller" checked={isBestSeller} onChange={e => setIsBestSeller(e.target.checked)} className="accent-gold" />
                  <Label htmlFor="bestSeller" className="text-sm">Best Seller</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="accent-gold" />
                  <Label htmlFor="isFeatured" className="text-sm">Featured</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-accent hover:bg-accent-hover text-white font-bold">
                  {editingId ? 'Update Product' : 'Save Product'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm() }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Product List */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No products yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {products.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-4 py-3 hover:bg-accent/30 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-gold/10 shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gold/40" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      {item.isBestSeller && <span className="text-[10px] bg-accent text-white px-1.5 py-0.5 rounded-full font-bold">★</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.brand} · {item.category} · {item.gender}</p>
                  </div>
                  <p className="hidden sm:block text-gold font-bold text-sm shrink-0">
                    {(() => {
                      try {
                        const sd = JSON.parse(item.stockData || '{}')
                        const firstSize = (item.sizes || '').split(',')[0]?.trim()
                        if (sd.prices?.[firstSize]) return formatCurrency(Number(sd.prices[firstSize]))
                      } catch {}
                      return formatCurrency(item.price)
                    })()}
                  </p>
                  <p className="hidden md:block text-xs text-muted-foreground shrink-0 w-12 text-right">{item.stock} stok</p>
                  <button onClick={() => handleEdit(item)} className="p-2 text-gold hover:bg-gold/10 rounded-lg transition-colors shrink-0">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
