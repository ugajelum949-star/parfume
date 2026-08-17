import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  size: string
  price: number
  image: string | null
  quantity: number
  category?: string
  notes?: string
  source?: 'normal' | 'war'
  warItemId?: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string, size: string) => void
  updateQuantity: (id: string, size: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => set((state) => {
        const quantityToAdd = newItem.quantity || 1
        const existingIndex = state.items.findIndex(
          (item) => item.id === newItem.id && item.size === newItem.size
        )

        if (existingIndex > -1) {
          const updatedItems = [...state.items]
          updatedItems[existingIndex].quantity += quantityToAdd
          return { items: updatedItems }
        }

        return { 
          items: [...state.items, { ...newItem, quantity: quantityToAdd }] 
        }
      }),

      removeItem: (id, size) => set((state) => ({
        items: state.items.filter(
          (item) => !(item.id === id && item.size === size)
        )
      })),

      updateQuantity: (id, size, quantity) => set((state) => {
        const cappedQuantity = Math.min(quantity, 99)
        if (cappedQuantity <= 0) {
          return {
            items: state.items.filter(
              (item) => !(item.id === id && item.size === size)
            )
          }
        }
        return {
          items: state.items.map((item) => {
            if (item.id === id && item.size === size) {
              return { ...item, quantity: cappedQuantity }
            }
            return item
          })
        }
      }),

      clearCart: () => set({ items: [] }),

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      totalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      }
    }),
    {
      name: 'shopping-cart-storage',
    }
  )
)
