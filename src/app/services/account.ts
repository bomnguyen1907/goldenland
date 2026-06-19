import type { AxiosRequestConfig } from 'axios'

import { getJSON } from '@/app/lib/api/http'
export * from './auth'

export type AccountDashboard = {
  balance: number
  properties?: ManagedPropertyStats
  vouchersActive?: number
  favoriteProperties?: number
  unreadNotifications?: number
  recentOrders?: unknown[]
}

export type ManagedPropertyStats = {
  total: number
  drafts?: number
  [status: string]: number | undefined
}

const EMPTY_STATS: ManagedPropertyStats = {
  total: 0,
}

export async function fetchAccountDashboard(
  config?: AxiosRequestConfig,
): Promise<AccountDashboard> {
  return getJSON<AccountDashboard>('/api/my/dashboard', config)
}

export async function fetchManagementDashboard(
  config?: AxiosRequestConfig,
): Promise<{ balance: number; stats: ManagedPropertyStats }> {
  const data = await fetchAccountDashboard(config)

  return {
    balance: Number(data.balance || 0),
    stats: data.properties ? { ...EMPTY_STATS, ...data.properties } : EMPTY_STATS,
  }
}

export const accountService = {
  fetchDashboard: fetchAccountDashboard,
  fetchManagementDashboard,
}
