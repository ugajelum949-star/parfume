'use server'

import { getSetting, updateSetting } from '@/app/actions/settings'

export interface ShippingConfig {
  freeShippingThreshold: number
  customizationFee: number
  transferDiscount: number
  instantPrice: number
  nextDaySurcharge: number
  promoQtyBundle: number
  promoQtyMega: number
}

const DEFAULTS: ShippingConfig = {
  freeShippingThreshold: 300000,
  customizationFee: 25000,
  transferDiscount: 50000,
  instantPrice: 45000,
  nextDaySurcharge: 20000,
  promoQtyBundle: 3,
  promoQtyMega: 5,
}

export async function getShippingConfig(): Promise<ShippingConfig> {
  const [threshold, fee, discount, instant, nextDay, bundle, mega] = await Promise.all([
    getSetting('shipping_free_threshold'),
    getSetting('shipping_customization_fee'),
    getSetting('shipping_transfer_discount'),
    getSetting('shipping_instant_price'),
    getSetting('shipping_nextday_surcharge'),
    getSetting('promo_qty_bundle'),
    getSetting('promo_qty_mega'),
  ])

  return {
    freeShippingThreshold: Number(threshold) || DEFAULTS.freeShippingThreshold,
    customizationFee: Number(fee) || DEFAULTS.customizationFee,
    transferDiscount: Number(discount) || DEFAULTS.transferDiscount,
    instantPrice: Number(instant) || DEFAULTS.instantPrice,
    nextDaySurcharge: Number(nextDay) || DEFAULTS.nextDaySurcharge,
    promoQtyBundle: Number(bundle) || DEFAULTS.promoQtyBundle,
    promoQtyMega: Number(mega) || DEFAULTS.promoQtyMega,
  }
}

export async function initShippingDefaults() {
  const defaults: Record<string, string> = {
    shipping_free_threshold: String(DEFAULTS.freeShippingThreshold),
    shipping_customization_fee: String(DEFAULTS.customizationFee),
    shipping_transfer_discount: String(DEFAULTS.transferDiscount),
    shipping_instant_price: String(DEFAULTS.instantPrice),
    shipping_nextday_surcharge: String(DEFAULTS.nextDaySurcharge),
    promo_qty_bundle: String(DEFAULTS.promoQtyBundle),
    promo_qty_mega: String(DEFAULTS.promoQtyMega),
  }

  for (const [key, value] of Object.entries(defaults)) {
    await updateSetting(key, value)
  }
}
