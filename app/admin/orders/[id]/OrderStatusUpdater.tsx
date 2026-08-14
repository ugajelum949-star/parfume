'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { updateOrderStatus } from '@/app/actions/orders'

const statuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'] as const

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Menunggu Bayar', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' },
  PAID: { label: 'Sudah Bayar', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  PROCESSING: { label: 'Diproses', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
  SHIPPED: { label: 'Dikirim', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30' },
  COMPLETED: { label: 'Selesai', color: 'bg-green-500/10 text-green-500 border-green-500/30' },
}

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)

  const handleUpdate = async (newStatus: string) => {
    setSaving(true)
    const result = await updateOrderStatus(orderId, newStatus)
    if (result.success) {
      setStatus(newStatus)
      toast.success('Status updated')
    } else {
      toast.error('Failed to update')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-2">
      {statuses.map((s) => {
        const cfg = statusConfig[s]
        const isActive = s === status
        return (
          <button
            key={s}
            onClick={() => handleUpdate(s)}
            disabled={saving || isActive}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              isActive
                ? `${cfg.color} border-current`
                : 'bg-transparent border-border hover:bg-accent text-muted-foreground'
            } ${saving ? 'opacity-50' : ''}`}
          >
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}
