import type { Listing } from '@/payload-types'
import type { AxiosRequestConfig } from 'axios'
import { buildQuery } from '@/app/lib/query'
import { getJSON } from '@/app/lib/http'

type ListingsCountByLocationApiResponse = {
  totalDocs: number
}

type PayloadFindResponse<T> = {
  docs: T[]
  page: number
  totalPages: number
  totalDocs: number
  hasNextPage: boolean
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

// Exporting list of listings, limit to 100 listings.
export async function fetchListings(config?: AxiosRequestConfig): Promise<ListingsResponse> {
  return getJSON<ListingsResponse>('/api/listings', config)
}
// Exporting listing detail by id.
export async function fetchListingDetail(id: string, config?: AxiosRequestConfig): Promise<ListingDetailResponse> {
  return getJSON<ListingDetailResponse>(`/api/listings/${id}`, config)
}

// Exporting new listings base on createdAt field, sorted by createdAt in descending order, limit to 8 listings. Client can sent limit = 8 to get next 8 listings, and so on. If limit is not sent, default to 8 listings.
export async function fetchNewListings(
  params?: {
    limit?: number
    page?: number
  },
  config?: AxiosRequestConfig,
): Promise<NewListingsResponse> {
  const query = buildQuery({
    sort: '-createdAt',
    limit: typeof params?.limit === 'number' ? params.limit : 8,
    page: typeof params?.page === 'number' ? params.page : 1,
  })

  const response = await getJSON<PayloadFindResponse<Listing>>(`/api/listings${query}`, config)

  return {
    data: response.docs,
    page: response.page,
    totalPages: response.totalPages,
    totalDocs: response.totalDocs,
    hasMore: response.hasNextPage,
  }
}

export type ListingsCountByLocationResponse = number

// Exporting count of listings base on location id
export async function fetchListingsCountByLocation(locationId: string, config?: AxiosRequestConfig): Promise<ListingsCountByLocationResponse> {
  // Normalize numeric category values from UI params.
  const categoryValue = /^\d+$/.test(String(locationId)) ? Number(locationId) : locationId

  // Payload count endpoint returns matched document count in totalDocs.
  const query = buildQuery({
    where: {
      provinceCode: {
        equals: categoryValue,
      },
    },
  })

  const response = await getJSON<ListingsCountByLocationApiResponse>(
    `/api/listings/count${query}`,
    config,
  )

  return response.totalDocs
}
