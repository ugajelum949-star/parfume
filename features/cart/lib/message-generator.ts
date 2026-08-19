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

function formatItems(items: CartItem[], nl: string): string {
  return items
    .map((item) => `- ${item.name} (${item.size}) x${item.quantity} = Rp${item.price.toLocaleString('id-ID')}`)
    .join(nl)
}

function formatGiftWrap(data: OrderData, nl: string): string {
  if (!data.giftWrap) return ''
  const line = `🎁 Gift Wrapping: Ya (+Rp${(data.giftWrapPrice || 0).toLocaleString('id-ID')})`
  const note = data.giftWrapNote ? `${nl}Pesan: ${data.giftWrapNote}` : ''
  return nl + line + note
}

function formatCustomerBlock(data: OrderData): string {
  return [
    `Data Pelanggan:`,
    `Nama: ${data.customerName}`,
    `HP: ${data.customerPhone}`,
    `Alamat: ${data.shippingAddress}`,
  ].join('\n')
}

export function generateWhatsAppOrderText(data: OrderData): string {
  const nl = '%0A'
  const items = formatItems(data.items, nl)
  const giftWrap = formatGiftWrap(data, nl)
  const header = `*Pesanan Baru — Parfume Store*${nl}${nl}Order ID: ${Date.now()}${nl}${nl}*Data Pelanggan:*${nl}Nama: ${data.customerName}${nl}HP: ${data.customerPhone}${nl}Alamat: ${data.shippingAddress}${nl}${nl}*Item:*${nl}${items}${giftWrap}${nl}${nl}*Total: Rp${data.total.toLocaleString('id-ID')}*`

  return header
}

export function generateTelegramOrderText(data: OrderData): string {
  const items = formatItems(data.items, '\n')
  const giftWrap = formatGiftWrap(data, '\n')

  const lines = [
    `Pesanan Baru — Parfume Store`,
    '',
    `Order ID: ${Date.now()}`,
    '',
    formatCustomerBlock(data),
    '',
    `Item:`,
    items,
  ]

  if (giftWrap) lines.push(giftWrap)
  lines.push('', `Total: Rp${data.total.toLocaleString('id-ID')}`)

  return lines.join('\n')
}

export function generateTransferOrderText(
  data: OrderData,
  orderId: string,
  settings: TransferSettings
): string {
  const items = formatItems(data.items, '\n')
  const giftWrap = formatGiftWrap(data, '\n')

  const bankInfo = [
    `Bank: ${settings.bankName || '-'}`,
    `No. Rekening: ${settings.accountNumber || '-'}`,
    `Atas Nama: ${settings.accountHolder || '-'}`,
  ].join('\n')

  const instructions = settings.transferInstructions
    ? `\n\nCatatan:\n${settings.transferInstructions}`
    : ''

  const lines = [
    `Pesanan Baru — Parfume Store`,
    '',
    `Order ID: ${orderId}`,
    '',
    formatCustomerBlock(data),
    '',
    `Item:`,
    items,
    '',
    `Total: Rp${data.total.toLocaleString('id-ID')}`,
  ]

  if (giftWrap) lines.push(giftWrap)
  lines.push('', `Pembayaran Transfer:\n${bankInfo}${instructions}`)

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
