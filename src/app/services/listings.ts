import type { Listing } from '@/payload-types'
import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

type ApiErrorResponse = {
  error?: string
}

export type ListingsResponse = {
  listings: Listing[]
}

export type ListingDetailResponse = {
  listing: Listing
}

export type NewListingsResponse = {
  data: Listing[]
  page: number
  totalPages: number
  totalDocs: number
  hasMore: boolean
}

// Helper function to fetch JSON data and handle errors
async function fetchJSON<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axios.get<T>(url, config)

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const payload = error.response?.data as ApiErrorResponse | undefined
      const errorMessage = payload?.error ?? error.message

      throw new Error(errorMessage)
    }

    throw error
  }
}

// Exporting list of listings, limit to 100 listings.
export async function fetchListings(config?: AxiosRequestConfig): Promise<ListingsResponse> {
  return fetchJSON<ListingsResponse>('/api/listings', config)
}
// Exporting listing detail by id.
export async function fetchListingDetail(id: string, config?: AxiosRequestConfig): Promise<ListingDetailResponse> {
  return fetchJSON<ListingDetailResponse>(`/api/listings/${id}`, config)
}

// Exporting new listings base on createdAt field, sorted by createdAt in descending order, limit to 8 listings. Client can sent limit = 8 to get next 8 listings, and so on. If limit is not sent, default to 8 listings.
export async function fetchNewListings(
  params?: {
    limit?: number
    page?: number
  },
  config?: AxiosRequestConfig,
): Promise<NewListingsResponse> {
  const searchParams = new URLSearchParams()

  if (typeof params?.limit === 'number') {
    searchParams.set('limit', String(params.limit))
  }

  if (typeof params?.page === 'number') {
    searchParams.set('page', String(params.page))
  }

  const query = searchParams.toString()
  const url = query ? `/api/listings-new?${query}` : '/api/listings-new'

  return fetchJSON<NewListingsResponse>(url, config)
}
