export async function sendTelegramMessage(token: string, chatId: string, text: string) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
  } catch (e) {
    console.error('[telegram] sendMessage failed:', e)
  }
}

export async function sendTelegramPhoto(
  token: string,
  chatId: string,
  photoBuffer: Buffer,
  caption: string
) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    const form = new FormData()
    form.append('chat_id', chatId)
    form.append('photo', new Blob([new Uint8Array(photoBuffer)], { type: 'image/jpeg' }), 'proof.jpg')
    form.append('caption', caption)
    await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    })
    clearTimeout(timeout)
  } catch (e) {
    console.error('[telegram] sendPhoto failed:', e)
  }
}

export async function sendPaymentProofWithActions(
  token: string,
  chatId: string,
  photoBuffer: Buffer,
  orderId: string,
  orderData: { customerName: string; customerPhone: string; total: number; paymentMethod: string }
) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

    const caption = [
      `🔔 *BUKTI TRANSFER BARU*`,
      ``,
      `• *Order:* \`${orderId.slice(0, 8)}...\``,
      `• *Customer:* ${orderData.customerName} (${orderData.customerPhone})`,
      `• *Total:* Rp ${orderData.total.toLocaleString('id-ID')}`,
      `• *Metode:* ${orderData.paymentMethod}`,
      ``,
      `_Periksa bukti di atas, lalu klik tombol:_`,
    ].join('\n')

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "✅ Setujui (PAID)", callback_data: `approve_${orderId}` },
          { text: "❌ Tolak", callback_data: `reject_${orderId}` },
        ],
      ],
    }

    const form = new FormData()
    form.append('chat_id', chatId)
    form.append('photo', new Blob([new Uint8Array(photoBuffer)], { type: 'image/jpeg' }), 'proof.jpg')
    form.append('caption', caption)
    form.append('parse_mode', 'Markdown')
    form.append('reply_markup', JSON.stringify(inlineKeyboard))

    await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    })
    clearTimeout(timeout)
  } catch (e) {
    console.error('[telegram] sendPaymentProofWithActions failed:', e)
  }
}
