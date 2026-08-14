'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getSettings } from '@/app/actions/settings'

interface StoreSettings {
  storeName: string
  storeSlogan: string
  storeLogo: string
  supportEmail: string
  whatsapp: string
  telegramUsername: string
}

const StoreContext = createContext<StoreSettings>({
  storeName: 'My Store',
  storeSlogan: '',
  storeLogo: '',
  supportEmail: '',
  whatsapp: '',
  telegramUsername: '',
})

export function useStoreSettings() {
  return useContext(StoreContext)
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'My Store',
    storeSlogan: '',
    storeLogo: '',
    supportEmail: '',
    whatsapp: '',
    telegramUsername: '',
  })

  useEffect(() => {
    getSettings(['store_name', 'store_slogan', 'store_logo', 'support_email', 'whatsapp', 'telegramUsername']).then((data) => {
      setSettings({
        storeName: data.store_name || 'My Store',
        storeSlogan: data.store_slogan || '',
        storeLogo: data.store_logo || '',
        supportEmail: data.support_email || '',
        whatsapp: data.whatsapp || '',
        telegramUsername: data.telegramUsername || '',
      })
    })
  }, [])

  return (
    <StoreContext.Provider value={settings}>
      {children}
    </StoreContext.Provider>
  )
}
