/**
 * Price helpers — single source for stockData price parsing.
 * stockData JSON shape: { prices: { "50ml": 250000 }, salePrices: { "50ml": 200000 } }
 */

interface StockData {
  prices?: Record<string, number>
  salePrices?: Record<string, number>
}

function parseStockData(stockData?: string): StockData {
  try { return JSON.parse(stockData || '{}') } catch { return {} }
}

/** Get original + sale + final price for a specific size. */
export function getSizePrice(
  stockData: string | undefined,
  size: string,
  fallbackPrice: number,
) {
  const sd = parseStockData(stockData)
  const original = sd.prices?.[size] ? Number(sd.prices[size]) : fallbackPrice
  const sale = sd.salePrices?.[size] ? Number(sd.salePrices[size]) : 0
  const hasDiscount = sale > 0 && sale < original
  return { original, sale, final: hasDiscount ? sale : original, hasDiscount }
}

/** Get display price using the first size — for product cards. */
export function getFirstSizePrice(stockData: string | undefined, sizes: string, fallbackPrice: number) {
  const firstSize = sizes.split(',')[0]?.trim() || ''
  return getSizePrice(stockData, firstSize, fallbackPrice)
}

/** Parse all size prices + sale prices from stockData — for product detail. */
export function parseAllSizePrices(stockData: string | undefined, sizes: string, fallbackPrice: number) {
  const sd = parseStockData(stockData)
  const sizeList = sizes.split(',').map(s => s.trim())

  const sizePrices: Record<string, number> = {}
  const sizeSalePrices: Record<string, number> = {}

  if (sd.prices && Object.keys(sd.prices).length > 0) {
    for (const s of sizeList) { sizePrices[s] = Number(sd.prices[s]) || fallbackPrice }
  } else {
    for (const s of sizeList) { sizePrices[s] = fallbackPrice }
  }

  if (sd.salePrices) {
    for (const [k, v] of Object.entries(sd.salePrices)) { sizeSalePrices[k] = Number(v) }
  }

  return { sizePrices, sizeSalePrices }
}

const POSTWAR_MARKUP = 1.7
const POSTWAR_DAYS = 7

/**
 * Get post-war display price for war-converted products.
 * If within 7 days of launch → premium price (warPrice × 1.7)
 * If after 7 days → return null (use normal pricing)
 * If no warPrice → return null (not a war product)
 */
export function getPostWarPrice(
  warPrice: number | null | undefined,
  launchedAt: Date | string | null | undefined,
) {
  if (!warPrice || !launchedAt) return null

  const launched = new Date(launchedAt).getTime()
  const now = Date.now()
  const msInDays = POSTWAR_DAYS * 24 * 60 * 60 * 1000

  if (now - launched < msInDays) {
    return Math.round(warPrice * POSTWAR_MARKUP)
  }
  return null // post-war period over, use normal pricing
}
