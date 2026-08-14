'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getBanners, createBanner, updateBanner, deleteBanner, toggleBanner } from '@/app/actions/banners'
import { uploadImage } from '@/app/actions/upload'

interface Banner {
  id: string
  title: string | null
  image: string
  link: string | null
  active: boolean
  order: number
  createdAt: Date | null
}

const emptyForm = { title: '', image: '', link: '', active: true, order: '0' }

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    const data = await getBanners()
    setBanners(data as Banner[])
  }

  useEffect(() => {
    async function init() {
      const data = await getBanners()
      setBanners(data as Banner[])
    }
    init()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const result = await uploadImage(base64, 'banners')
      if (result.success && result.url) {
        setForm(f => ({ ...f, image: result.url! }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.image) { toast.error('Image is required'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.set('title', form.title)
      fd.set('image', form.image)
      fd.set('link', form.link)
      fd.set('active', String(form.active))
      fd.set('order', form.order)

      if (editingId) {
        await updateBanner(editingId, fd)
        toast.success('Banner updated')
      } else {
        await createBanner(fd)
        toast.success('Banner created')
      }
      setForm(emptyForm)
      setEditingId(null)
      setShowForm(false)
      await load()
    } catch {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  const handleEdit = (b: Banner) => {
    setForm({
      title: b.title || '',
      image: b.image,
      link: b.link || '',
      active: b.active,
      order: String(b.order),
    })
    setEditingId(b.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    await deleteBanner(id)
    toast.success('Deleted')
    await load()
  }

  const handleToggle = async (id: string, active: boolean) => {
    await toggleBanner(id, active)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true) }} className="bg-accent text-white hover:bg-gold-light">
          <Plus className="w-4 h-4 mr-2" /> Add Banner
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? 'Edit Banner' : 'New Banner'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title (optional)</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Summer Sale" />
                </div>
                <div>
                  <Label>Link (optional)</Label>
                  <Input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="/products" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Order</Label>
                  <Input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="active" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-gold" />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
              <div>
                <Label>Banner Image</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Label className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 px-3 py-2 rounded-lg border border-border text-sm transition-colors">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {form.image ? 'Change' : 'Upload'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </Label>
                </div>
                {form.image && <img src={form.image} alt="" className="w-full h-32 object-cover rounded-lg mt-2 border border-border" />}
              </div>
              <Button type="submit" disabled={saving} className="bg-accent text-white hover:bg-gold-light">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {banners.map((b) => (
          <Card key={b.id} className="bg-card border-border">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-32 h-16 rounded-lg overflow-hidden bg-gold/5 shrink-0">
                <img src={b.image} alt={b.title || 'Banner'} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{b.title || 'No title'}</p>
                <p className="text-xs text-muted-foreground truncate">{b.link || 'No link'} · Order: {b.order}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(b.id, !b.active)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${b.active ? 'bg-green-600/20 text-green-400' : 'bg-muted text-muted-foreground'}`}
                >
                  {b.active ? 'Active' : 'Inactive'}
                </button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(b)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {banners.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No banners yet.</p>
        )}
      </div>
    </div>
  )
}
