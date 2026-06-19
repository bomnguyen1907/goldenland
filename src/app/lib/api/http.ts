import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

export type ApiErrorResponse = {
  error?: string
  message?: string
  [key: string]: unknown
}

export class ApiRequestError extends Error {
  payload?: ApiErrorResponse
  status?: number

  constructor(message: string, options?: { payload?: ApiErrorResponse; status?: number }) {
    super(message)
    this.name = 'ApiRequestError'
    this.payload = options?.payload
    this.status = options?.status
  }
}

export function getServerBaseURL(): string {
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL
  }

  if (process.env.PAYLOAD_PUBLIC_SERVER_URL) {
    return process.env.PAYLOAD_PUBLIC_SERVER_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return 'http://localhost:3000'
}

export function resolveRequestURL(url: string): string {
  if (/^https?:\/\//.test(url)) {
    return url
  }

  if (typeof window === 'undefined') {
    return `${getServerBaseURL()}${url}`
  }

  return url
}

const toApiRequestError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorResponse | undefined
    return new ApiRequestError(payload?.error ?? payload?.message ?? error.message, {
      payload,
      status: error.response?.status,
    })
  }

  return error instanceof Error ? error : new Error('Request failed')
}

export async function getJSON<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axios.get<T>(resolveRequestURL(url), config)

    return response.data
  } catch (error) {
    throw toApiRequestError(error)
  }
}

export async function postJSON<TResponse, TBody = unknown>(
  url: string,
  data?: TBody,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  try {
    const response = await axios.post<TResponse>(resolveRequestURL(url), data, config)

    return response.data
  } catch (error) {
    throw toApiRequestError(error)
  }
}

export async function patchJSON<TResponse, TBody = unknown>(
  url: string,
  data?: TBody,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  try {
    const response = await axios.patch<TResponse>(resolveRequestURL(url), data, config)

    return response.data
  } catch (error) {
    throw toApiRequestError(error)
  }
}

export async function deleteJSON<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axios.delete<T>(resolveRequestURL(url), config)

    return response.data
  } catch (error) {
    throw toApiRequestError(error)
  }
}
