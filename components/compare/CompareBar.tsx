'use client'

import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useCompareStore } from '@/features/compare/store'
import { Button } from '@/components/ui/button'

export function CompareBar() {
  const router = useRouter()
  const { ids, remove, clear } = useCompareStore()
  const count = useCompareStore((s) => s.count())

  if (count === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        {/* Thumbnails */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {ids.map((id) => (
            <button
              key={id}
              onClick={() => remove(id)}
              className="relative group shrink-0"
            >
              <div className="w-12 h-12 rounded-lg bg-gold/5 border border-border overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">
                  {id.slice(0, 6)}
                </div>
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <X className="w-3.5 h-3.5 text-white" />
              </div>
            </button>
          ))}
          {count < 3 && (
            <div className="w-12 h-12 rounded-lg border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
              +
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={clear}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Hapus Semua
          </Button>
          <Button
            onClick={() => router.push(`/compare?ids=${ids.join(',')}`)}
            className="bg-accent hover:bg-accent-hover text-white font-bold text-xs"
            size="sm"
          >
            Bandingkan ({count}/3)
          </Button>
        </div>
      </div>
    </div>
  )
}
