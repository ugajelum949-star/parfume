'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getSettings } from '@/app/actions/settings'

interface StoreSettings {
  storeName: string
  storeLogo: string
  supportEmail: string
  whatsapp: string
  telegramUsername: string
  floatingButtonEnabled: boolean
  floatingButtonType: string
}

const DEFAULTS: StoreSettings = {
  storeName: 'My Store',
  storeLogo: '',
  supportEmail: '',
  whatsapp: '',
  telegramUsername: '',
  floatingButtonEnabled: false,
  floatingButtonType: 'whatsapp',
}

const StoreContext = createContext<StoreSettings>(DEFAULTS)

export function useStoreSettings() {
  return useContext(StoreContext)
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULTS)

  useEffect(() => {
    getSettings(['store_name', 'store_logo', 'support_email', 'whatsapp', 'telegramUsername', 'floatingButtonEnabled', 'floatingButtonType']).then((data) => {
      setSettings({
        storeName: data.store_name || 'My Store',
        storeLogo: data.store_logo || '',
        supportEmail: data.support_email || '',
        whatsapp: data.whatsapp || '',
        telegramUsername: data.telegramUsername || '',
        floatingButtonEnabled: data.floatingButtonEnabled === 'true',
        floatingButtonType: data.floatingButtonType || 'whatsapp',
      })
    })
  }, [])

  return (
    <StoreContext.Provider value={settings}>
      {children}
    </StoreContext.Provider>
  )
}
