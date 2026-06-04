import type { AxiosRequestConfig } from 'axios'
import qs from 'qs'
import { deleteJSON, getJSON } from '@/app/lib/http'

export type ManagedProperty = {
  id: number
  title: string
  price: number
  priceUnit: string
  address?: string
  street?: string
  provinceCode?: string
  wardCode?: string
  status: string
  postType?: string
  propertyType: string
  area?: number
  createdAt: string
  images?: { image: string; sort: number }[]
}

export type ManagedPropertyStats = {
  total: number
  drafts?: number
  [status: string]: number | undefined
}

type DashboardResponse = {
  balance?: number
  properties?: ManagedPropertyStats
}

type PropertiesResponse = {
  docs?: ManagedProperty[]
  totalPages?: number
}

const EMPTY_STATS: ManagedPropertyStats = {
  total: 0,
}

export async function fetchManagementDashboard(
  config?: AxiosRequestConfig,
): Promise<{ balance: number; stats: ManagedPropertyStats }> {
  const data = await getJSON<DashboardResponse>('/api/my/dashboard', config)

  return {
    balance: Number(data.balance || 0),
    stats: data.properties ? { ...EMPTY_STATS, ...data.properties } : EMPTY_STATS,
  }
}

export async function fetchManagementProperties(
  params: {
    userId: string | number
    status?: string
    keyword?: string
    verifiedOnly?: boolean
    propertyTypes?: string[]
    provinceCodes?: string[]
    wardCodes?: string[]
    projectIds?: string[]
    minPrice?: number
    maxPrice?: number
    minArea?: number
    maxArea?: number
    directions?: string[]
    legalStatuses?: string[]
    bedroomsList?: number[]
    bathroomsList?: number[]
    page?: number
    limit?: number
  },
  config?: AxiosRequestConfig,
): Promise<{ properties: ManagedProperty[]; totalPages: number }> {
  const and: Record<string, unknown>[] = [{ user: { equals: params.userId } }]

  if (params.status) {
    and.push({ status: { equals: params.status } })
  }

  const keyword = params.keyword?.trim()
  if (keyword) {
    const keywordOr: Record<string, unknown>[] = [
      { title: { contains: keyword } },
      { slug: { contains: keyword } },
    ]
    const numericId = Number(keyword)
    if (Number.isInteger(numericId) && numericId > 0) {
      keywordOr.unshift({ id: { equals: numericId } })
    }
    and.push({ or: keywordOr })
  }

  if (params.verifiedOnly) and.push({ isVerified: { equals: true } })
  if (params.propertyTypes?.length) and.push({ propertyType: { in: params.propertyTypes } })
  if (params.provinceCodes?.length) and.push({ provinceCode: { in: params.provinceCodes } })
  if (params.wardCodes?.length) and.push({ wardCode: { in: params.wardCodes } })
  if (params.projectIds?.length) and.push({ project: { in: params.projectIds } })
  if (typeof params.minPrice === 'number') and.push({ price: { greater_than_equal: params.minPrice } })
  if (typeof params.maxPrice === 'number') and.push({ price: { less_than_equal: params.maxPrice } })
  if (typeof params.minArea === 'number') and.push({ area: { greater_than_equal: params.minArea } })
  if (typeof params.maxArea === 'number') and.push({ area: { less_than_equal: params.maxArea } })
  if (params.directions?.length) and.push({ direction: { in: params.directions } })
  if (params.legalStatuses?.length) and.push({ legalStatus: { in: params.legalStatuses } })
  if (params.bedroomsList?.length) and.push({ bedrooms: { in: params.bedroomsList } })
  if (params.bathroomsList?.length) and.push({ bathrooms: { in: params.bathroomsList } })

  const where = and.length === 1 ? and[0] : { and }

  const query = qs.stringify(
    {
      where,
      sort: '-createdAt',
      limit: params.limit ?? 10,
      page: params.page ?? 1,
      depth: 0,
    },
    { encodeValuesOnly: true },
  )

  const data = await getJSON<PropertiesResponse>(`/api/properties?${query}`, config)

  return {
    properties: Array.isArray(data.docs) ? data.docs : [],
    totalPages: Number(data.totalPages || 1),
  }
}

export async function deleteManagedProperty(
  propertyId: string | number,
  config?: AxiosRequestConfig,
): Promise<void> {
  await deleteJSON(`/api/properties/${propertyId}`, config)
}
