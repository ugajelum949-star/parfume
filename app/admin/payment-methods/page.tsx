'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { CreditCard, Plus, Pencil, Trash2, Upload, X, Check, Ban } from 'lucide-react'
import {
  getPaymentMethods,
  savePaymentMethod,
  deletePaymentMethod,
  uploadQrisImage,
} from '@/app/actions/payment'

type PaymentMethod = {
  id: string
  type: string
  label: string
  accountName: string | null
  accountNumber: string | null
  qrisImageUrl: string | null
  isActive: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

const defaultForm = {
  type: 'transfer',
  label: '',
  accountName: '',
  accountNumber: '',
  qrisImageUrl: '',
  isActive: true,
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    try {
      const data = await getPaymentMethods()
      setMethods(data as PaymentMethod[])
    } catch {
      toast.error('Failed to load payment methods')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const data = await getPaymentMethods()
        setMethods(data as PaymentMethod[])
      } catch {
        toast.error('Failed to load payment methods')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const resetForm = () => {
    setForm(defaultForm)
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (m: PaymentMethod) => {
    setForm({
      type: m.type,
      label: m.label,
      accountName: m.accountName || '',
      accountNumber: m.accountNumber || '',
      qrisImageUrl: m.qrisImageUrl || '',
      isActive: m.isActive,
    })
    setEditingId(m.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this payment method?')) return
    try {
      await deletePaymentMethod(id)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const base64 = reader.result as string
          const result = await uploadQrisImage(base64)
          if (result.success && result.url) {
            setForm((f) => ({ ...f, qrisImageUrl: result.url! }))
            toast.success('Image uploaded')
          } else {
            toast.error('Upload failed')
          }
        } catch {
          toast.error('Upload failed')
        } finally {
          setUploading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch {
      setUploading(false)
      toast.error('Upload failed')
    }
  }

  const handleSave = async () => {
    if (!form.label.trim()) {
      toast.error('Label is required')
      return
    }
    setSaving(true)
    try {
      await savePaymentMethod(
        {
          type: form.type,
          label: form.label.trim(),
          accountName: form.accountName.trim() || undefined,
          accountNumber: form.accountNumber.trim() || undefined,
          qrisImageUrl: form.qrisImageUrl || undefined,
          isActive: form.isActive,
        },
        editingId || undefined
      )
      toast.success(editingId ? 'Updated' : 'Created')
      resetForm()
      load()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-gold" />
            Payment Methods
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage QRIS and bank transfer options
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-accent text-white hover:bg-gold/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Method
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId ? 'Edit Method' : 'New Method'}
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                >
                  <option value="transfer">Bank Transfer</option>
                  <option value="qris">QRIS</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. BCA, Mandiri, QRIS"
                />
              </div>
              {form.type === 'transfer' && (
                <>
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input
                      value={form.accountName}
                      onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      value={form.accountNumber}
                      onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                      placeholder="1234567890"
                    />
                  </div>
                </>
              )}
              {form.type === 'qris' && (
                <div className="space-y-2">
                  <Label>QRIS Image</Label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-transparent hover:bg-accent text-sm transition-colors">
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Choose Image'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {form.qrisImageUrl && (
                      <span className="text-xs text-green-500 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Uploaded
                      </span>
                    )}
                  </div>
                  {form.qrisImageUrl && (
                    <img
                      src={form.qrisImageUrl}
                      alt="QRIS Preview"
                      className="w-32 h-32 object-contain rounded border border-border mt-2"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  form.isActive ? 'bg-gold' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    form.isActive ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <Label className="cursor-pointer" onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}>
                Active
              </Label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving || uploading} className="bg-accent text-white hover:bg-gold/90">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent>
          </Card>
        ) : methods.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center text-muted-foreground">
              No payment methods yet. Add one to get started.
            </CardContent>
          </Card>
        ) : (
          methods.map((m) => (
            <Card key={m.id} className="bg-card border-border">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <CreditCard className="w-5 h-5 text-gold shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{m.label}</span>
                      <Badge variant={m.type === 'qris' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                        {m.type}
                      </Badge>
                      {!m.isActive && (
                        <Badge variant="destructive" className="text-[10px]">
                          <Ban className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {m.type === 'transfer' && m.accountName && (
                        <span>
                          {m.accountName}
                          {m.accountNumber && ` - ${m.accountNumber}`}
                        </span>
                      )}
                      {m.type === 'qris' && m.qrisImageUrl && (
                        <span className="text-green-500">QRIS image set</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(m)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
