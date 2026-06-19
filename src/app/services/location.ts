import type { AxiosRequestConfig } from 'axios'

import { getJSON } from '@/app/lib/api/http'

export type ProvinceOption = {
  code: string
  name: string
}

export type WardOption = {
  code: string
  name: string
}

export function fetchProvinces(config?: AxiosRequestConfig) {
  return getJSON<ProvinceOption[]>('/api/divisions/provinces', config)
}

export function fetchWards(provinceCode: string, config?: AxiosRequestConfig) {
  return getJSON<WardOption[]>(`/api/divisions/wards/${provinceCode}`, config)
}

export const locationService = {
  fetchProvinces,
  fetchWards,
}
