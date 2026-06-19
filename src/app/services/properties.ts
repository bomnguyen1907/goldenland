import type { Property } from '@/payload-types'
import type { AxiosRequestConfig } from 'axios'

import { buildAppQuery, buildPayloadQuery } from '@/app/lib/api/query'
import { deleteJSON, getJSON, postJSON } from '@/app/lib/api/http'
import { payloadApi, type PayloadFindResponse } from '@/app/lib/api/payload'

const VIP_POST_TYPES = ['silver', 'gold', 'diamond']

type PropertiesCountByLocationApiResponse = {
  totalDocs: number
}

type SearchPropertiesResponse = {
  success: boolean
  data: Property[]
  pagination: {
    page: number
    totalPages: number
    totalDocs: number
    limit?: number
    hasNextPage: boolean
    hasPrevPage?: boolean
  }
}

export type PropertyFiltersState = {
  keyword?: string
  district?: number
  verifiedOnly?: boolean
  propertyTypes?: string[]
  provinceCodes?: string[]
  wardCodes?: string[]
  streets?: string[]
  projectIds?: string[]
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  postTypes?: string[]
  directions?: string[]
  legalStatuses?: string[]
  furnitureStatuses?: string[]
  bedroomsList?: number[]
  bathroomsList?: number[]
}

export type PropertySortValue =
  | 'default'
  | 'price_asc'
  | 'price_desc'
  | 'area_asc'
  | 'area_desc'

export type PropertyFilterOptionsResponse = {
  success: boolean
  propertyTypes: string[]
  regions: Array<{ code: string; label: string }>
  wards: Array<{ code: string; label: string; provinceCode: string }>
  streets: Array<{ name: string; provinceCode: string; wardCode: string }>
  projects: Array<{ id: string; name: string; provinceCode: string; wardCode: string }>
  priceRange: { min: number | null; max: number | null }
  areaRange: { min: number | null; max: number | null }
  dynamicAttributes: Array<{
    key: string
    values: string[]
  }>
}

export type PropertyDetailResponse = {
  property: Property
}

export type PropertiesListResponse = {
  data: Property[]
  page: number
  totalPages: number
  totalDocs: number
  hasMore: boolean
}

export type PropertiesByIdsResponse = Property[]

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

type ManagedPropertiesResponse = {
  docs?: ManagedProperty[]
  totalPages?: number
}

export type PropertyWritePayload = Record<string, unknown>

export type SubmitPostFlowResponse = {
  success?: boolean
  property?: Property
  message?: string
}

export type PropertyReportReason =
  | 'scam'
  | 'wrong_info'
  | 'duplicate'
  | 'wrong_image'
  | 'sold_not_removed'
  | 'other'

export type SubmitPropertyReportPayload = {
  propertyId: number
  reason: PropertyReportReason
  detail?: string
}

export type SubmitPropertyReportResponse = {
  success?: boolean
  message?: string
}

export function fetchActivePostingPrices<T>(
  config?: AxiosRequestConfig,
): Promise<PayloadFindResponse<T>> {
  return payloadApi.find<T>(
    'posting-prices',
    {
      depth: 0,
      limit: 20,
      sort: 'sort',
      where: { isActive: { equals: true } },
    },
    config,
  )
}

export async function fetchPropertyDetail(
  id: string,
  config?: AxiosRequestConfig,
): Promise<PropertyDetailResponse> {
  const response = await payloadApi.findById<Property | PropertyDetailResponse>(
    'properties',
    id,
    { depth: 2 },
    config,
  )

  if (response && typeof response === 'object' && 'property' in response) {
    return response as PropertyDetailResponse
  }

  return { property: response as Property }
}

export async function fetchForYouProperties(
  property: Property,
  limit = 6,
  config?: AxiosRequestConfig,
): Promise<Property[]> {
  const baseConditions: Array<Record<string, unknown>> = [
    { id: { not_equals: property.id } },
    { status: { equals: 'active' } },
  ]

  if (property.wardCode) {
    baseConditions.push({
      or: [
        { wardCode: { equals: property.wardCode } },
        { provinceCode: { equals: property.provinceCode } },
      ],
    })
  } else if (property.provinceCode) {
    baseConditions.push({
      provinceCode: { equals: property.provinceCode },
    })
  }

  const vipResponse = await payloadApi.find<Property>(
    'properties',
    {
      where: {
        and: [...baseConditions, { postType: { in: VIP_POST_TYPES } }],
      },
      sort: '-createdAt',
      limit,
      depth: 2,
    },
    config,
  )

  const remaining = Math.max(limit - vipResponse.docs.length, 0)
  if (remaining === 0) return vipResponse.docs

  const normalResponse = await payloadApi.find<Property>(
    'properties',
    {
      where: {
        and: [...baseConditions, { postType: { equals: 'normal' } }],
      },
      sort: '-createdAt',
      limit: remaining,
      depth: 2,
    },
    config,
  )

  return [...vipResponse.docs, ...normalResponse.docs]
}

export async function fetchNewProperties(
  params?: {
    limit?: number
    page?: number
  },
  config?: AxiosRequestConfig,
): Promise<PropertiesListResponse> {
  const response = await payloadApi.find<Property>(
    'properties',
    {
      sort: '-createdAt',
      limit: typeof params?.limit === 'number' ? params.limit : 8,
      page: typeof params?.page === 'number' ? params.page : 1,
      depth: 2,
    },
    config,
  )

  return {
    data: response.docs,
    page: response.page ?? 1,
    totalPages: response.totalPages ?? 1,
    totalDocs: response.totalDocs ?? response.docs.length,
    hasMore: Boolean(response.hasNextPage),
  }
}

export async function fetchPropertiesByPostType(
  params?: {
    limit?: number
    page?: number
    sort?: PropertySortValue
    filters?: PropertyFiltersState
  },
  config?: AxiosRequestConfig,
): Promise<PropertiesListResponse> {
  const sortBySelection: Record<PropertySortValue, string> = {
    default: '-createdAt',
    price_asc: 'price',
    price_desc: '-price',
    area_asc: 'area',
    area_desc: '-area',
  }

  const filters = params?.filters
  const query = buildAppQuery({
    sort: sortBySelection[params?.sort ?? 'default'],
    limit: typeof params?.limit === 'number' ? params.limit : 10,
    page: typeof params?.page === 'number' ? params.page : 1,
    keyword: filters?.keyword || undefined,
    district: typeof filters?.district === 'number' ? filters.district : undefined,
    verifiedOnly: filters?.verifiedOnly ? 'true' : undefined,
    propertyTypes: filters?.propertyTypes?.length ? filters.propertyTypes.join(',') : undefined,
    provinceCodes: filters?.provinceCodes?.length ? filters.provinceCodes.join(',') : undefined,
    wardCodes: filters?.wardCodes?.length ? filters.wardCodes.join(',') : undefined,
    streets: filters?.streets?.length ? filters.streets.join(',') : undefined,
    projectIds: filters?.projectIds?.length ? filters.projectIds.join(',') : undefined,
    minPrice: typeof filters?.minPrice === 'number' ? filters.minPrice : undefined,
    maxPrice: typeof filters?.maxPrice === 'number' ? filters.maxPrice : undefined,
    minArea: typeof filters?.minArea === 'number' ? filters.minArea : undefined,
    maxArea: typeof filters?.maxArea === 'number' ? filters.maxArea : undefined,
    postTypes: filters?.postTypes?.length ? filters.postTypes.join(',') : undefined,
    directions: filters?.directions?.length ? filters.directions.join(',') : undefined,
    legalStatuses: filters?.legalStatuses?.length ? filters.legalStatuses.join(',') : undefined,
    furnitureStatuses: filters?.furnitureStatuses?.length
      ? filters.furnitureStatuses.join(',')
      : undefined,
    bedroomsList: filters?.bedroomsList?.length ? filters.bedroomsList.join(',') : undefined,
    bathroomsList: filters?.bathroomsList?.length ? filters.bathroomsList.join(',') : undefined,
  })

  const response = await getJSON<SearchPropertiesResponse>(`/api/search/properties${query}`, config)

  return {
    data: response.data,
    page: response.pagination.page,
    totalPages: response.pagination.totalPages,
    totalDocs: response.pagination.totalDocs,
    hasMore: response.pagination.hasNextPage,
  }
}

export async function fetchPropertiesByIds(
  ids: Array<number | string>,
  config?: AxiosRequestConfig,
): Promise<PropertiesByIdsResponse> {
  if (!ids.length) return []

  const response = await payloadApi.find<Property>(
    'properties',
    {
      where: {
        id: {
          in: ids,
        },
      },
      limit: ids.length,
      depth: 0,
    },
    config,
  )

  return response.docs
}

export function fetchPropertyFilterOptions(config?: AxiosRequestConfig) {
  return getJSON<PropertyFilterOptionsResponse>('/api/search/properties/filters', config)
}

type CountWhereClause = {
  or?: Array<Record<string, unknown>>
  provinceCode?: {
    equals: string
  }
}

function buildLocationCountWhere(locationId: string): CountWhereClause {
  const normalized = String(locationId).trim()

  if (normalized === '01' || normalized === '1') {
    return {
      or: [
        { provinceCode: { equals: '01' } },
        { provinceCode: { equals: '1' } },
      ],
    }
  }

  if (normalized === '77' || normalized === '75') {
    return {
      or: [
        { provinceCode: { equals: '75' } },
        { provinceCode: { equals: '77' } },
        { address: { contains: 'Đồng Nai' } },
        { address: { contains: 'Dong Nai' } },
      ],
    }
  }

  if (normalized === '74') {
    return {
      or: [
        { provinceCode: { equals: '74' } },
        { address: { contains: 'Bình Dương' } },
        { address: { contains: 'Binh Duong' } },
      ],
    }
  }

  return {
    provinceCode: {
      equals: normalized,
    },
  }
}

export async function fetchPropertiesCountByLocation(
  locationId: string,
  config?: AxiosRequestConfig,
): Promise<number> {
  const response = await getJSON<PropertiesCountByLocationApiResponse>(
    `/api/properties/count${buildPayloadQuery({ where: buildLocationCountWhere(locationId) })}`,
    config,
  )

  return response.totalDocs
}

export function submitPostFlow(data: FormData, config?: AxiosRequestConfig) {
  return postJSON<SubmitPostFlowResponse, FormData>('/api/post-flow/submit', data, config)
}

export function submitPropertyReport(
  data: SubmitPropertyReportPayload,
  config?: AxiosRequestConfig,
) {
  return postJSON<SubmitPropertyReportResponse, SubmitPropertyReportPayload>(
    '/api/property-reports/submit',
    data,
    config,
  )
}

export function createProperty(data: PropertyWritePayload, config?: AxiosRequestConfig) {
  return payloadApi.create<Property, PropertyWritePayload>('properties', data, config)
}

export function updateProperty(
  id: string | number,
  data: PropertyWritePayload,
  config?: AxiosRequestConfig,
) {
  return payloadApi.update<Property, PropertyWritePayload>('properties', id, data, config)
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

  if (params.status) and.push({ status: { equals: params.status } })

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

  const response = await payloadApi.find<ManagedProperty>(
    'properties',
    {
      where: and.length === 1 ? and[0] : { and },
      sort: '-createdAt',
      limit: params.limit ?? 10,
      page: params.page ?? 1,
      depth: 0,
    },
    config,
  ) as ManagedPropertiesResponse

  return {
    properties: Array.isArray(response.docs) ? response.docs : [],
    totalPages: Number(response.totalPages || 1),
  }
}

export async function deleteManagedProperty(
  propertyId: string | number,
  config?: AxiosRequestConfig,
): Promise<void> {
  await deleteJSON(`/api/properties/${propertyId}`, config)
}

export const propertiesService = {
  fetchActivePostingPrices,
  fetchDetail: fetchPropertyDetail,
  fetchForYou: fetchForYouProperties,
  fetchNew: fetchNewProperties,
  fetchByPostType: fetchPropertiesByPostType,
  fetchByIds: fetchPropertiesByIds,
  fetchFilters: fetchPropertyFilterOptions,
  fetchCountByLocation: fetchPropertiesCountByLocation,
  submitPostFlow,
  submitReport: submitPropertyReport,
  create: createProperty,
  update: updateProperty,
  fetchManagement: fetchManagementProperties,
  deleteManaged: deleteManagedProperty,
}
