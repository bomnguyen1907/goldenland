import type { AxiosRequestConfig } from 'axios'

import { buildPayloadQuery } from './query'
import { deleteJSON, getJSON, patchJSON, postJSON } from './http'

export type PayloadFindResponse<T> = {
  docs: T[]
  page?: number
  totalPages?: number
  totalDocs?: number
  limit?: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export const payloadApi = {
  find<T>(collection: string, query?: Record<string, unknown>, config?: AxiosRequestConfig) {
    return getJSON<PayloadFindResponse<T>>(
      `/api/${collection}${query ? buildPayloadQuery(query) : ''}`,
      config,
    )
  },

  findById<T>(
    collection: string,
    id: string | number,
    query?: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ) {
    return getJSON<T>(`/api/${collection}/${id}${query ? buildPayloadQuery(query) : ''}`, config)
  },

  create<TResponse, TBody = unknown>(
    collection: string,
    data: TBody,
    config?: AxiosRequestConfig,
  ) {
    return postJSON<TResponse, TBody>(`/api/${collection}`, data, config)
  },

  update<TResponse, TBody = unknown>(
    collection: string,
    id: string | number,
    data: TBody,
    config?: AxiosRequestConfig,
  ) {
    return patchJSON<TResponse, TBody>(`/api/${collection}/${id}`, data, config)
  },

  delete<TResponse>(collection: string, id: string | number, config?: AxiosRequestConfig) {
    return deleteJSON<TResponse>(`/api/${collection}/${id}`, config)
  },
}
