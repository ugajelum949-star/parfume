import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

interface CompareStore {
  ids: string[]
  toggle: (id: string) => void
  isSelected: (id: string) => boolean
  count: () => number
  clear: () => void
  remove: (id: string) => void
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      ids: [],

      toggle: (id) => set((state) => {
        if (state.ids.includes(id)) {
          return { ids: state.ids.filter((i) => i !== id) }
        }
        if (state.ids.length >= 3) {
          toast.error('Maksimal 3 produk untuk dibandingkan')
          return {}
        }
        return { ids: [...state.ids, id] }
      }),

      isSelected: (id) => get().ids.includes(id),

      count: () => get().ids.length,

      clear: () => set({ ids: [] }),

      remove: (id) => set((state) => ({
        ids: state.ids.filter((i) => i !== id),
      })),
    }),
    {
      name: 'parfume_compare',
    }
  )
)
