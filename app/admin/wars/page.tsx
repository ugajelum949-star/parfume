'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, X, Loader2, Swords } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getWars, createWar, deleteWar } from '@/app/actions/wars'
import { uploadImage } from '@/app/actions/upload'

interface WarItem {
  id?: string
  name: string
  brand: string
  category: string
  gender: string
  price: number
  sizes: string
  stock: number
  image: string
}

interface War {
  id: string
  name: string
  description: string | null
  image: string | null
  startTime: Date
  endTime: Date
  active: boolean
  converted: boolean
  createdAt: Date | null
}

export default function AdminWarsPage() {
  const [wars, setWars] = useState<War[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [warName, setWarName] = useState('')
  const [warDesc, setWarDesc] = useState('')
  const [warImage, setWarImage] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [warItems, setWarItems] = useState<WarItem[]>([
    { name: '', brand: '-', category: 'Fresh', gender: 'Unisex', price: 0, sizes: '50ml', stock: 20, image: '' },
  ])

  const load = async () => { const data = await getWars(); setWars(data as War[]) }
  useEffect(() => {
    async function init() {
      const data = await getWars()
      setWars(data as War[])
    }
    init()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx?: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const result = await uploadImage(base64, 'wars')
      if (result.success && result.url) {
        if (idx !== undefined) {
          setWarItems(prev => prev.map((item, i) => i === idx ? { ...item, image: result.url! } : item))
        } else {
          setWarImage(result.url)
        }
        toast.success('Image uploaded')
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!warName.trim()) { toast.error('War name required'); return }
    if (!startTime || !endTime) { toast.error('Start and end time required'); return }
    if (warItems.length === 0 || !warItems[0].name) { toast.error('At least 1 item required'); return }
    if (warItems.some(item => item.price <= 0 || item.stock <= 0)) { toast.error('Price and stock must be > 0'); return }

    setSaving(true)
    try {
      const result = await createWar({
        name: warName,
        description: warDesc,
        image: warImage,
        startTime,
        endTime,
        items: warItems,
      })
      if (result.success) {
        toast.success('War created')
        setShowForm(false)
        setWarName(''); setWarDesc(''); setWarImage(''); setStartTime(''); setEndTime('')
        setWarItems([{ name: '', brand: '-', category: 'Fresh', gender: 'Unisex', price: 0, sizes: '50ml', stock: 20, image: '' }])
        await load()
      } else {
        toast.error(result.error || 'Failed')
      }
    } catch {
      toast.error('Failed to create war')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this war?')) return
    await deleteWar(id)
    toast.success('Deleted')
    await load()
  }

  const addItem = () => {
    setWarItems(prev => [...prev, { name: '', brand: '-', category: 'Fresh', gender: 'Unisex', price: 0, sizes: '50ml', stock: 20, image: '' }])
  }

  const removeItem = (idx: number) => {
    setWarItems(prev => prev.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, field: keyof WarItem, value: string | number) => {
    setWarItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const formatDate = (d: Date | string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const now = new Date()
  const getStatus = (w: War) => {
    if (w.converted) return { label: 'Selesai', color: 'text-green-500' }
    if (new Date(w.endTime) < now) return { label: 'Expired', color: 'text-yellow-500' }
    if (new Date(w.startTime) <= now && new Date(w.endTime) >= now) return { label: 'Live', color: 'text-red-500' }
    return { label: 'Scheduled', color: 'text-blue-500' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Swords className="w-6 h-6 text-gold" /> Wars</h1>
          <p className="text-muted-foreground text-sm">Product drops & flash launches</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-accent text-white hover:bg-gold-light">
          <Plus className="w-4 h-4 mr-2" /> New War
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Create War</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>War Name *</Label><Input value={warName} onChange={e => setWarName(e.target.value)} placeholder="War Mykonos" /></div>
              <div><Label>Description</Label><Input value={warDesc} onChange={e => setWarDesc(e.target.value)} placeholder="Limited drop..." /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Start Time *</Label><Input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
              <div><Label>End Time *</Label><Input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
            </div>
            <div>
              <Label>War Image</Label>
              <Label className="cursor-pointer inline-flex items-center gap-2 bg-accent hover:bg-accent/80 px-3 py-2 rounded-lg border border-border text-sm transition-colors mt-1">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {warImage ? 'Change Image' : 'Upload Image'}
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e)} disabled={uploading} />
              </Label>
              {warImage && <img src={warImage} alt="" className="w-full h-32 object-cover rounded-lg mt-2 border border-border" />}
            </div>

            {/* War items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Products</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addItem}><Plus className="w-3 h-3 mr-1" /> Add</Button>
              </div>
              {warItems.map((item, idx) => (
                <div key={idx} className="bg-accent/30 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Item {idx + 1}</span>
                    {warItems.length > 1 && <button onClick={() => removeItem(idx)} className="text-destructive text-xs">Remove</button>}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Input placeholder="Name" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} />
                    <Input placeholder="Brand" value={item.brand} onChange={e => updateItem(idx, 'brand', e.target.value)} />
                    <Input type="number" placeholder="Price" value={item.price || ''} onChange={e => updateItem(idx, 'price', Number(e.target.value))} />
                    <Input type="number" placeholder="Stock" value={item.stock || ''} onChange={e => updateItem(idx, 'stock', Number(e.target.value))} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Sizes" value={item.sizes} onChange={e => updateItem(idx, 'sizes', e.target.value)} />
                    <select value={item.category} onChange={e => updateItem(idx, 'category', e.target.value)} className="bg-input border border-border rounded-lg px-3 py-1.5 text-sm">
                      <option>Fresh</option><option>Floral</option><option>Woody</option><option>Amber</option>
                    </select>
                    <select value={item.gender} onChange={e => updateItem(idx, 'gender', e.target.value)} className="bg-input border border-border rounded-lg px-3 py-1.5 text-sm">
                      <option>Men</option><option>Women</option><option>Unisex</option>
                    </select>
                  </div>
                  <Label className="cursor-pointer inline-flex items-center gap-2 bg-accent hover:bg-accent/80 px-3 py-1.5 rounded-lg border border-border text-xs transition-colors">
                    {item.image ? 'Change' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, idx)} disabled={uploading} />
                  </Label>
                  {item.image && <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />}
                </div>
              ))}
            </div>

            <Button onClick={handleSubmit} disabled={saving} className="bg-accent text-white hover:bg-gold-light">
              {saving ? 'Creating...' : 'Create War'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* War list */}
      <div className="space-y-3">
        {wars.map(w => {
          const status = getStatus(w)
          return (
            <Card key={w.id} className="bg-card border-border">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-16 md:w-20 h-12 rounded-lg overflow-hidden bg-gold/5 shrink-0">
                  {w.image ? <img src={w.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Swords className="w-4 h-4 text-gold/40" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{w.name}</p>
                    <span className={`text-xs font-bold ${status.color}`}>{status.label}</span>
                    {w.converted && <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">→ Products</span>}
                  </div>
                  <p className="hidden sm:block text-xs text-muted-foreground">
                    {formatDate(w.startTime)} — {formatDate(w.endTime)}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
        {wars.length === 0 && <p className="text-center text-muted-foreground py-8">No wars yet.</p>}
      </div>
    </div>
  )
}
