'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Star, Plus, Pencil, Trash2, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '@/app/actions/testimonials'
import { useImageUpload } from '@/lib/hooks/use-image-upload'

interface Testimonial {
  id: string
  name: string
  role: string | null
  content: string
  rating: number
  avatar: string | null
  proofImage: string | null
  createdAt: Date | null
}

const emptyForm = { name: '', role: '', content: '', rating: 5, avatar: '', proofImage: '' }

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange?.(i)} className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <Star className={`w-4 h-4 ${i <= rating ? 'fill-gold text-gold' : 'text-muted-foreground'}`} />
        </button>
      ))}
    </div>
  )
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const { uploading, handleUpload } = useImageUpload('testimonials')

  const load = async () => {
    const data = await getTestimonials()
    setTestimonials(data as Testimonial[])
  }

  useEffect(() => {
    async function init() {
      const data = await getTestimonials()
      setTestimonials(data as Testimonial[])
    }
    init()
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'proofImage') => {
    handleUpload(e.target.files?.[0], url => setForm((f) => ({ ...f, [field]: url })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.content.trim()) {
      toast.error('Name and content are required')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.set('name', form.name)
      fd.set('role', form.role)
      fd.set('content', form.content)
      fd.set('rating', String(form.rating))
      fd.set('avatar', form.avatar)
      fd.set('proofImage', form.proofImage)

      if (editingId) {
        await updateTestimonial(editingId, fd)
        toast.success('Testimonial updated')
      } else {
        await createTestimonial(fd)
        toast.success('Testimonial created')
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

  const handleEdit = (t: Testimonial) => {
    setForm({ name: t.name, role: t.role || '', content: t.content, rating: t.rating, avatar: t.avatar || '', proofImage: t.proofImage || '' })
    setEditingId(t.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    await deleteTestimonial(id)
    toast.success('Deleted')
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reviews / Testimonials</h1>
        <Button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true) }} className="bg-accent text-white hover:bg-gold-light">
          <Plus className="w-4 h-4 mr-2" /> Add Review
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? 'Edit Review' : 'New Review'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Customer name" />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="e.g. Loyal Customer" />
                </div>
              </div>
              <div>
                <Label>Review *</Label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="What did they say about the product?"
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Rating</Label>
                  <StarRating rating={form.rating} onChange={(r) => setForm((f) => ({ ...f, rating: r }))} />
                </div>
                <div>
                  <Label>Customer Photo</Label>
                  <Label className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 px-3 py-2 rounded-lg border border-border text-sm transition-colors">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                      {form.proofImage ? 'Change Photo' : 'Upload Photo'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'proofImage')} disabled={uploading} />
                  </Label>
                  {form.proofImage && <img src={form.proofImage} alt="" className="w-20 h-20 rounded-lg mt-2 object-cover border border-border" />}
                </div>
              </div>
              <Button type="submit" disabled={saving} className="bg-accent text-white hover:bg-gold-light">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {testimonials.map((t) => (
          <Card key={t.id} className="bg-card border-border">
            <CardContent className="flex items-start gap-4 p-4">
              {t.avatar ? (
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <span className="text-gold font-bold text-sm">{t.name.charAt(0)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{t.name}</span>
                  {t.role && <span className="text-xs text-muted-foreground">({t.role})</span>}
                  <StarRating rating={t.rating} />
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.content}</p>
                {t.proofImage && (
                  <img src={t.proofImage} alt="Proof" className="w-16 h-16 rounded-lg mt-2 object-cover border border-border" />
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {testimonials.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No reviews yet. Add one above.</p>
        )}
      </div>
    </div>
  )
}
