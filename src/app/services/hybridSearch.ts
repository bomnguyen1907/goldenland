import type { Article, Project, Property } from '@/payload-types'

import { buildAppQuery } from '@/app/lib/api/query'
import { getJSON } from '@/app/lib/api/http'
import type {
  ParsedSearchResult,
  SearchTab,
} from '@/app/(frontend)/(site)/home/lib/search/types'

type SearchPagination = {
  page: number
  totalPages: number
  totalDocs: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type SearchResponse<T> = {
  success: boolean
  data: T[]
  pagination: SearchPagination
}

export type HybridSearchGroup<T> = {
  items: T[]
  total: number
  error?: string
}

export type HybridSearchResult = {
  tab: SearchTab
  parsed: ParsedSearchResult
  property: HybridSearchGroup<Property>
  project: HybridSearchGroup<Project>
  news: HybridSearchGroup<Article>
}

type SearchOptions = {
  page?: number
  limit?: number
}

const DEFAULT_LIMIT = 5

const emptyGroup = <T>(): HybridSearchGroup<T> => ({
  items: [],
  total: 0,
})

export async function searchPropertiesByParsed(
  parsed: ParsedSearchResult,
  options?: SearchOptions,
): Promise<HybridSearchGroup<Property>> {
  const response = await getJSON<SearchResponse<Property>>(
    `/api/search/properties${buildAppQuery({
      keyword: parsed.keyword || undefined,
      district: parsed.filters.district || undefined,
      propertyType: parsed.filters.propertyType || undefined,
      provinceCode: parsed.filters.provinceCode || undefined,
      bedrooms: parsed.filters.bedrooms || undefined,
      bathrooms: parsed.filters.bathrooms || undefined,
      minPrice: parsed.filters.minPrice || undefined,
      maxPrice: parsed.filters.maxPrice || undefined,
      minArea: parsed.filters.minArea || undefined,
      maxArea: parsed.filters.maxArea || undefined,
      direction: parsed.filters.direction || undefined,
      legalStatus: parsed.filters.legalStatus || undefined,
      postType: parsed.filters.postType || undefined,
      furnitureStatus: parsed.filters.furnitureStatus || undefined,
      page: options?.page ?? 1,
      limit: options?.limit ?? DEFAULT_LIMIT,
      sort: '-createdAt',
    })}`,
  )

  return {
    items: response.data,
    total: response.pagination.totalDocs,
  }
}

export async function searchProjectsByParsed(
  parsed: ParsedSearchResult,
  options?: SearchOptions,
): Promise<HybridSearchGroup<Project>> {
  const response = await getJSON<SearchResponse<Project>>(
    `/api/search/projects${buildAppQuery({
      keyword: parsed.keyword || undefined,
      district: parsed.filters.district || undefined,
      provinceCode: parsed.filters.provinceCode || undefined,
      page: options?.page ?? 1,
      limit: options?.limit ?? DEFAULT_LIMIT,
      sort: '-createdAt',
    })}`,
  )

  return {
    items: response.data,
    total: response.pagination.totalDocs,
  }
}

export async function searchNewsByParsed(
  parsed: ParsedSearchResult,
  options?: SearchOptions,
): Promise<HybridSearchGroup<Article>> {
  const response = await getJSON<SearchResponse<Article>>(
    `/api/search/news${buildAppQuery({
      keyword: parsed.keyword || undefined,
      page: options?.page ?? 1,
      limit: options?.limit ?? DEFAULT_LIMIT,
      sort: '-publishedAt',
    })}`,
  )

  return {
    items: response.data,
    total: response.pagination.totalDocs,
  }
}

export async function runHybridSearch(
  tab: SearchTab,
  parsed: ParsedSearchResult,
  options?: SearchOptions,
): Promise<HybridSearchResult> {
  const baseResult: HybridSearchResult = {
    tab,
    parsed,
    property: emptyGroup<Property>(),
    project: emptyGroup<Project>(),
    news: emptyGroup<Article>(),
  }

  if (tab === 'property') {
    return {
      ...baseResult,
      property: await searchPropertiesByParsed(parsed, options),
    }
  }

  if (tab === 'project') {
    return {
      ...baseResult,
      project: await searchProjectsByParsed(parsed, options),
    }
  }

  if (tab === 'news') {
    return {
      ...baseResult,
      news: await searchNewsByParsed(parsed, options),
    }
  }

  const [property, project, news] = await Promise.allSettled([
    searchPropertiesByParsed(parsed, options),
    searchProjectsByParsed(parsed, options),
    searchNewsByParsed(parsed, options),
  ])

  return {
    ...baseResult,
    property:
      property.status === 'fulfilled'
        ? property.value
        : { ...emptyGroup<Property>(), error: property.reason?.message || 'Search failed' },
    project:
      project.status === 'fulfilled'
        ? project.value
        : { ...emptyGroup<Project>(), error: project.reason?.message || 'Search failed' },
    news:
      news.status === 'fulfilled'
        ? news.value
        : { ...emptyGroup<Article>(), error: news.reason?.message || 'Search failed' },
  }
}
