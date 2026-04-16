import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import type { Article, Media } from '@/payload-types'
import { buildQuery } from '@/app/lib/query'

// API error shape
type ApiErrorResponse = {
  error?: string
}

// Payload find response shape
type PayloadFindResponse<T> = {
  docs: T[]
}

type RawFeaturedArticle = Pick<Article, 'id' | 'title' | 'excerpt' | 'updatedAt' | 'thumbnail'>

export type FeaturedArticleSummary = Pick<Article, 'id' | 'title' | 'excerpt' | 'updatedAt'> & {
  imageUrl?: string
}

// Base URL used to build absolute media URLs from Payload paths.
const SERVER_URL = 'http://localhost:3000'

const resolveMediaURL = (thumbnail?: (number | null) | Media): string | undefined => {
  // Relationship can be ID-only or missing depending on query depth/select.
  if (!thumbnail || typeof thumbnail === 'number') return undefined
  if (!thumbnail.url) return undefined
  if (thumbnail.url.startsWith('http://') || thumbnail.url.startsWith('https://')) {
    return thumbnail.url
  }

  return `${SERVER_URL}${thumbnail.url}`
}

// Generic GET helper with error handling
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

// Fetch featured articles by category id
export async function fetchFeaturedArticlesBasedOnCategoryId(
  category: string | number,
  config?: AxiosRequestConfig,
): Promise<FeaturedArticleSummary[]> {
    // Normalize numeric category values from UI params.
    const categoryValue = /^\d+$/.test(String(category)) ? Number(category) : category

    // Request only fields used by the featured section.
    const query = buildQuery({
        select: {
            title: true,
            excerpt: true,
            updatedAt: true,
        thumbnail: true,
        },
        where: {
            category: {
            equals: categoryValue,
            },
        },
        limit: 6,
        sort: '-createdAt',
    })

    const response = await fetchJSON<PayloadFindResponse<RawFeaturedArticle>>(
      `/api/articles${query}`,
      config,
    )

    // Keep only fields used by the homepage section.
    return response.docs.map(({ id, title, excerpt, updatedAt, thumbnail }) => ({
      id,
      title,
      excerpt,
      updatedAt,
      imageUrl: resolveMediaURL(thumbnail),
    }))
}


