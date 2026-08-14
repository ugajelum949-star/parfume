export type ZoneId = 'jabodetabek' | 'jawa' | 'sumatera' | 'kalimantan' | 'sulawesi' | 'bali_nusa' | 'maluku' | 'papua';

export interface Zone {
  id: ZoneId;
  label: string;
  basePrice: number;
}

export interface Province {
  id: string;
  name: string;
  zoneId: ZoneId;
}

export interface ShippingService {
  id: string;
  label: string;
  available: boolean;
  price: number;
}

export const SHIPPING_ZONES: Zone[] = [
  { id: 'jabodetabek', label: 'Jabodetabek', basePrice: 15000 },
  { id: 'jawa', label: 'Jawa', basePrice: 20000 },
  { id: 'sumatera', label: 'Sumatera', basePrice: 28000 },
  { id: 'kalimantan', label: 'Kalimantan', basePrice: 32000 },
  { id: 'sulawesi', label: 'Sulawesi', basePrice: 32000 },
  { id: 'bali_nusa', label: 'Bali & Nusa Tenggara', basePrice: 28000 },
  { id: 'maluku', label: 'Maluku', basePrice: 40000 },
  { id: 'papua', label: 'Papua', basePrice: 50000 },
];

export const PROVINCES: Province[] = [
  // Jabodetabek (6)
  { id: 'DKI', name: 'DKI Jakarta', zoneId: 'jabodetabek' },
  { id: 'Banten', name: 'Banten', zoneId: 'jabodetabek' },
  { id: 'JawaBarat', name: 'Jawa Barat', zoneId: 'jabodetabek' },
  { id: 'JawaTengah', name: 'Jawa Tengah', zoneId: 'jabodetabek' },
  { id: 'JawaTimur', name: 'Jawa Timur', zoneId: 'jabodetabek' },
  { id: 'DIY', name: 'DI Yogyakarta', zoneId: 'jabodetabek' },
  // Sumatera (9)
  { id: 'Aceh', name: 'Aceh', zoneId: 'sumatera' },
  { id: 'SumateraUtara', name: 'Sumatera Utara', zoneId: 'sumatera' },
  { id: 'SumateraBarat', name: 'Sumatera Barat', zoneId: 'sumatera' },
  { id: 'Riau', name: 'Riau', zoneId: 'sumatera' },
  { id: 'Jambi', name: 'Jambi', zoneId: 'sumatera' },
  { id: 'SumateraSelatan', name: 'Sumatera Selatan', zoneId: 'sumatera' },
  { id: 'Bengkulu', name: 'Bengkulu', zoneId: 'sumatera' },
  { id: 'Lampung', name: 'Lampung', zoneId: 'sumatera' },
  { id: 'KepBangkaBelitung', name: 'Kep. Bangka Belitung', zoneId: 'sumatera' },
  // Kalimantan (5)
  { id: 'KalimantanBarat', name: 'Kalimantan Barat', zoneId: 'kalimantan' },
  { id: 'KalimantanTengah', name: 'Kalimantan Tengah', zoneId: 'kalimantan' },
  { id: 'KalimantanSelatan', name: 'Kalimantan Selatan', zoneId: 'kalimantan' },
  { id: 'KalimantanTimur', name: 'Kalimantan Timur', zoneId: 'kalimantan' },
  { id: 'KalimantanUtara', name: 'Kalimantan Utara', zoneId: 'kalimantan' },
  // Sulawesi (4)
  { id: 'SulawesiUtara', name: 'Sulawesi Utara', zoneId: 'sulawesi' },
  { id: 'SulawesiTengah', name: 'Sulawesi Tengah', zoneId: 'sulawesi' },
  { id: 'SulawesiSelatan', name: 'Sulawesi Selatan', zoneId: 'sulawesi' },
  { id: 'SulawesiTenggara', name: 'Sulawesi Tenggara', zoneId: 'sulawesi' },
  // Bali & Nusa Tenggara (3)
  { id: 'Bali', name: 'Bali', zoneId: 'bali_nusa' },
  { id: 'NTB', name: 'Nusa Tenggara Barat', zoneId: 'bali_nusa' },
  { id: 'NTT', name: 'Nusa Tenggara Timur', zoneId: 'bali_nusa' },
  // Maluku (2)
  { id: 'Maluku', name: 'Maluku', zoneId: 'maluku' },
  { id: 'MalukuUtara', name: 'Maluku Utara', zoneId: 'maluku' },
  // Papua (1)
  { id: 'Papua', name: 'Papua', zoneId: 'papua' },
];

const INSTANT_PRICE = 45000;
const NEXT_DAY_SURCHARGE = 20000;

export function getZoneByProvince(provinceId: string): ZoneId | undefined {
  return PROVINCES.find(p => p.id === provinceId)?.zoneId;
}

export function getShippingCost(zoneId: ZoneId): number {
  return SHIPPING_ZONES.find(z => z.id === zoneId)?.basePrice ?? 0;
}

export function getAvailableServices(zoneId: ZoneId): ShippingService[] {
  const base = getShippingCost(zoneId);
  const isCore = zoneId === 'jabodetabek' || zoneId === 'jawa';

  const services: ShippingService[] = [
    { id: 'reguler', label: 'Reguler', available: true, price: base },
    { id: 'instant', label: 'Instant', available: isCore, price: INSTANT_PRICE },
    { id: 'next_day', label: 'Next Day', available: !isCore, price: base + NEXT_DAY_SURCHARGE },
  ];

  return services.filter(s => s.available);
}

export interface OrderInput {
  subtotal: number;
  totalQty: number;
  shippingZone: ZoneId;
  shippingService: string;
  isTransfer?: boolean;
  freeShippingThreshold?: number;
}

export interface OrderResult {
  subtotal: number;
  customization: number;
  shipping: number;
  shippingIncluded: boolean;
  total: number;
  promo: {
    freeShipping: boolean;
    activePromos: string[];
  };
}

const CUSTOMIZATION_FEE = 25000;
const DEFAULT_FREE_SHIPPING_THRESHOLD = 300000;

export function calculateOrderTotal(input: OrderInput): OrderResult {
  const { subtotal, totalQty, shippingZone, shippingService, isTransfer } = input;
  const freeShippingThreshold = input.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD;
  const services = getAvailableServices(shippingZone);
  const selected = services.find(s => s.id === shippingService);
  const baseShipping = selected?.price ?? 0;

  const activePromos: string[] = [];
  let freeShipping = false;

  if (subtotal >= freeShippingThreshold) {
    activePromos.push('Gratis Ongkir');
    freeShipping = true;
  }

  const customization = totalQty > 0 ? CUSTOMIZATION_FEE * totalQty : 0;
  const shipping = freeShipping ? 0 : baseShipping;
  const transferDiscount = isTransfer ? 50000 : 0;
  const total = subtotal + customization + shipping - transferDiscount;

  return {
    subtotal,
    customization,
    shipping,
    shippingIncluded: !freeShipping,
    total: Math.max(0, total),
    promo: {
      freeShipping,
      activePromos,
    },
  };
}
