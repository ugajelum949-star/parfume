'use client'

import { useStoreSettings } from '@/components/providers/StoreProvider'
import { MessageCircle, Send } from 'lucide-react'

export function FloatingChat() {
  const { floatingButtonEnabled, floatingButtonType, whatsapp, telegramUsername } = useStoreSettings()

  if (!floatingButtonEnabled) return null

  const waNumber = whatsapp?.replace(/\D/g, '') || ''
  const tgUsername = telegramUsername?.replace(/^@/, '') || ''

  const showWA = (floatingButtonType === 'whatsapp' || floatingButtonType === 'both') && waNumber
  const showTG = (floatingButtonType === 'telegram' || floatingButtonType === 'both') && tgUsername

  if (!showWA && !showTG) return null

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-3 lg:bottom-6">
      {showTG && (
        <a
          href={`https://t.me/${tgUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-lg transition-colors"
          title="Chat via Telegram"
        >
          <Send className="w-6 h-6 text-white" />
        </a>
      )}
      {showWA && (
        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg transition-colors"
          title="Chat via WhatsApp"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </a>
      )}
    </div>
  )
}
