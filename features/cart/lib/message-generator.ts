import { CartItem } from '../store'

interface OrderData {
  customerName: string
  customerPhone: string
  shippingAddress: string
  items: CartItem[]
  total: number
  giftWrap?: boolean
  giftWrapNote?: string
  giftWrapPrice?: number
}

interface TransferSettings {
  bankName?: string
  accountNumber?: string
  accountHolder?: string
  transferInstructions?: string
}

export function generateWhatsAppOrderText(data: OrderData): string {
  const items = data.items
    .map(
      (item) =>
        `- ${item.name} (${item.size}) x${item.quantity} = Rp${item.price.toLocaleString('id-ID')}`
    )
    .join('%0A')

  const giftWrapLine = data.giftWrap
    ? `%0A🎁 Gift Wrapping: Ya (+Rp${(data.giftWrapPrice || 0).toLocaleString('id-ID')})${data.giftWrapNote ? `%0APesan: ${data.giftWrapNote}` : ''}`
    : ''

  const text = [
    '*Pesanan Baru — Parfume Store*',
    '',
    `Order ID: ${Date.now()}`,
    '',
    '*Data Pelanggan:*',
    `Nama: ${data.customerName}`,
    `HP: ${data.customerPhone}`,
    `Alamat: ${data.shippingAddress}`,
    '',
    '*Item:*',
    items,
    giftWrapLine,
    '',
    `*Total: Rp${data.total.toLocaleString('id-ID')}*`,
  ].join('%0A')

  return text
}

export function generateTelegramOrderText(data: OrderData): string {
  const items = data.items
    .map(
      (item) =>
        `- ${item.name} (${item.size}) x${item.quantity} = Rp${item.price.toLocaleString('id-ID')}`
    )
    .join('\n')

  const giftWrapLine = data.giftWrap
    ? `🎁 Gift Wrapping: Ya (+Rp${(data.giftWrapPrice || 0).toLocaleString('id-ID')})${data.giftWrapNote ? `\nPesan: ${data.giftWrapNote}` : ''}`
    : ''

  const lines = [
    `Pesanan Baru — Parfume Store`,
    '',
    `Order ID: ${Date.now()}`,
    '',
    `Data Pelanggan:`,
    `Nama: ${data.customerName}`,
    `HP: ${data.customerPhone}`,
    `Alamat: ${data.shippingAddress}`,
    '',
    `Item:`,
    items,
  ]

  if (giftWrapLine) {
    lines.push('', giftWrapLine)
  }

  lines.push('', `Total: Rp${data.total.toLocaleString('id-ID')}`)

  return lines.join('\n')
}

export function generateTransferOrderText(
  data: OrderData,
  orderId: string,
  settings: TransferSettings
): string {
  const items = data.items
    .map(
      (item) =>
        `- ${item.name} (${item.size}) x${item.quantity} = Rp${item.price.toLocaleString('id-ID')}`
    )
    .join('\n')

  const bankInfo = [
    '',
    `Bank: ${settings.bankName || '-'}`,
    `No. Rekening: ${settings.accountNumber || '-'}`,
    `Atas Nama: ${settings.accountHolder || '-'}`,
  ].join('\n')

  const instructions = settings.transferInstructions
    ? `\n\nCatatan:\n${settings.transferInstructions}`
    : ''

  const giftWrapLine = data.giftWrap
    ? `🎁 Gift Wrapping: Ya (+Rp${(data.giftWrapPrice || 0).toLocaleString('id-ID')})${data.giftWrapNote ? `\nPesan: ${data.giftWrapNote}` : ''}`
    : ''

  const lines = [
    `Pesanan Baru — Parfume Store`,
    '',
    `Order ID: ${orderId}`,
    '',
    `Data Pelanggan:`,
    `Nama: ${data.customerName}`,
    `HP: ${data.customerPhone}`,
    `Alamat: ${data.shippingAddress}`,
    '',
    `Item:`,
    items,
    '',
    `Total: Rp${data.total.toLocaleString('id-ID')}`,
  ]

  if (giftWrapLine) {
    lines.push('', giftWrapLine)
  }

  lines.push('', `Pembayaran Transfer:${bankInfo}${instructions}`)

  return lines.join('\n')
}

export function getTelegramUrl(cleanUsername: string, text: string): string {
  let baseUrl: string

  if (cleanUsername.startsWith('https://t.me/')) {
    baseUrl = cleanUsername
  } else if (cleanUsername.startsWith('t.me/')) {
    baseUrl = `https://${cleanUsername}`
  } else {
    baseUrl = `https://t.me/${cleanUsername}`
  }

  return `${baseUrl}?text=${encodeURIComponent(text)}`
}
