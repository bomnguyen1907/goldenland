import type { AxiosRequestConfig } from 'axios'

import { getJSON, postJSON } from '@/app/lib/api/http'

export type CalculatePackagePricePayload = {
  packageId: string | number
  selectedMonths?: number
  promotionId?: string
  promotionCode?: string
}

export type CalculatePackagePriceResponse = {
  originalAmount: number
  durationDays: number
  availablePromotions?: unknown[]
  promotionDiscount?: number
  totalAmount: number
  appliedPromotion?: unknown | null
}

export type PurchasePackagePayload = {
  packageId: string | number
  selectedMonths?: number
  voucherCode?: string
  promotionId?: string
  promotionCode?: string
}

export type PurchasePackageResponse = {
  success?: boolean
  message?: string
  order?: unknown
}

export type CreateTopUpPayload = {
  amount: number
  paymentMethod?: 'bank_transfer'
}

export type CreateTopUpResponse = {
  success: boolean
  provider: string
  order: string
  orderCode: string
  providerOrderCode: number
  amount: number
  paymentLinkId: string
  checkoutUrl: string
  qrCode?: string
  message?: string
}

export type TopUpStatusResponse = {
  success: boolean
  order: string
  status: string
  amount: number
  paidAt?: string | null
}

export function calculatePackagePrice(
  data: CalculatePackagePricePayload,
  config?: AxiosRequestConfig,
) {
  return postJSON<CalculatePackagePriceResponse, CalculatePackagePricePayload>(
    '/api/calculate-package-price',
    data,
    config,
  )
}

export function purchasePackage(data: PurchasePackagePayload, config?: AxiosRequestConfig) {
  return postJSON<PurchasePackageResponse, PurchasePackagePayload>(
    '/api/purchase-package',
    data,
    config,
  )
}

export function createTopUp(data: CreateTopUpPayload, config?: AxiosRequestConfig) {
  return postJSON<CreateTopUpResponse, CreateTopUpPayload>('/api/top-up', data, config)
}

export function fetchTopUpStatus(orderId: string | number, config?: AxiosRequestConfig) {
  return getJSON<TopUpStatusResponse>(`/api/top-up-status/${orderId}`, config)
}

export const billingService = {
  calculatePackagePrice,
  purchasePackage,
  createTopUp,
  fetchTopUpStatus,
}
