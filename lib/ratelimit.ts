type RateLimitRecord = {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()

export const rateLimit = (identifier: string, limit: number = 10, windowMs: number = 60 * 1000) => {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (record && now > record.resetTime) {
    rateLimitMap.delete(identifier)
  }

  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return { success: true }
  }

  const currentRecord = rateLimitMap.get(identifier)!
  
  if (currentRecord.count >= limit) {
    return { success: false }
  }

  currentRecord.count += 1
  return { success: true }
}
