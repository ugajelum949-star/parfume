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

// Popular perfume brands (Local, Middle Eastern / Arabian, Niche & Designer)
export const BRANDS = [
  // Local Indonesian Viral Brands
  'Mykonos',
  'Velixir',
  'HMNS (Humans)',
  'SAFF & Co.',
  'Kahf',
  'Onix Fragrance',
  'Alchemist Fragrance',
  'Lilith & Eve',
  'Oullu',
  'Project 1945',
  'Crusita',
  'Heura',
  'Mine. Perfumery',
  'Carl & Claire',
  'Kitschy',
  'Alien Objects',
  'Extrait de Parfum',

  // Middle Eastern & Arabian Clone Hits
  'Afnan',
  'Lattafa',
  'Armaf / Club de Nuit',
  'Al Haramain',
  'Maison Alhambra',
  'Rasasi',
  'Swiss Arabian',
  'Fragrance World',
  'Paris Corner',
  'Ahmed Al Maghribi',
  'Khadlaj',
  'Asdaaf',

  // Designer & Luxury Brands
  'Dior',
  'Chanel',
  'Tom Ford',
  'Creed',
  'YSL (Yves Saint Laurent)',
  'Versace',
  'Giorgio Armani',
  'Bvlgari',
  'Jean Paul Gaultier',
  'Hugo Boss',
  'Gucci',
  'Prada',
  'Maison Francis Kurkdjian (MFK)',
  'Jo Malone',
  'Le Labo',
  'Diptyque',
  'Byredo',
  'Xerjoff',
  'Parfums de Marly',
  'Nishane',
  'Mancera',
  'Montale',
  'Dolce & Gabbana',
  'Valentino',
  'Hermès',
  'Carolina Herrera',
  'Paco Rabanne',
  'Narciso Rodriguez',
  'Montblanc',
  'Calvin Klein',
  'Burberry',
  'Lacoste',

  'Other',
] as const
