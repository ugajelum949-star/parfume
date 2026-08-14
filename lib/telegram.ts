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
