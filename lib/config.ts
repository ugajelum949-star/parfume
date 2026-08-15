// Base URL helper — prevents "undefined" in canonical/OG URLs
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || ''
}

// Scent families
export const SCENT_FAMILIES = [
  'Fresh',
  'Floral',
  'Woody',
  'Amber',
] as const

export type ScentFamily = typeof SCENT_FAMILIES[number]

// Gender
export const GENDERS = ['Men', 'Women', 'Unisex'] as const
export type Gender = typeof GENDERS[number]

// Size presets for perfumes (ml)
export const SIZE_PRESETS: Record<string, { size: string; qty: number }[]> = {
  'Standard': [
    { size: '10ml', qty: 20 },
    { size: '30ml', qty: 15 },
    { size: '50ml', qty: 10 },
    { size: '100ml', qty: 10 },
  ],
  'Mini': [
    { size: '5ml', qty: 25 },
    { size: '10ml', qty: 20 },
  ],
}

export const DEFAULT_SIZE_PRESET = SIZE_PRESETS['Standard']

// Gift Wrapping
export const GIFT_WRAP_PRICE = 15000

// Popular perfume brands
export const BRANDS = [
  'Dior',
  'Chanel',
  'Tom Ford',
  'Creed',
  'YSL',
  'Versace',
  'Giorgio Armani',
  'Bvlgari',
  'Hugo Boss',
  'Jean Paul Gaultier',
  'Lacoste',
  'Calvin Klein',
  'Burberry',
  'Gucci',
  'Prada',
  'Other',
] as const
