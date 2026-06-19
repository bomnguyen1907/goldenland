import type { Article } from '@/payload-types'
import type { AxiosRequestConfig } from 'axios'

import { postJSON } from '@/app/lib/api/http'
import { getServerBaseURL } from '@/app/lib/api/http'
import { payloadApi } from '@/app/lib/api/payload'

type RawFeaturedArticle = Pick<Article, 'id' | 'title' | 'excerpt' | 'updatedAt' | 'thumbnailUrl'>

export type FeaturedArticleSummary = Pick<Article, 'id' | 'title' | 'excerpt' | 'updatedAt'> & {
  imageUrl?: string | null
}

const resolveMediaURL = (thumbnailUrl?: string | null): string | undefined => {
  if (!thumbnailUrl) return undefined
  if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) {
    return thumbnailUrl
  }

  return `${getServerBaseURL()}${thumbnailUrl}`
}

const toFeaturedArticleSummary = ({
  id,
  title,
  excerpt,
  updatedAt,
  thumbnailUrl,
}: RawFeaturedArticle): FeaturedArticleSummary => ({
  id,
  title,
  excerpt,
  updatedAt,
  imageUrl: resolveMediaURL(thumbnailUrl),
})

export function trackArticleView(articleId: string | number) {
  return postJSON<{ success: boolean; viewCount?: number }, Record<string, never>>(
    `/api/articles/${articleId}/view`,
    {},
  )
}

export async function fetchFeaturedArticlesBasedOnCategoryId(
  category: string | number,
  config?: AxiosRequestConfig,
): Promise<FeaturedArticleSummary[]> {
  const categoryValue = /^\d+$/.test(String(category)) ? Number(category) : category

  const response = await payloadApi.find<RawFeaturedArticle>(
    'articles',
    {
      select: {
        title: true,
        excerpt: true,
        updatedAt: true,
        thumbnailUrl: true,
      },
      where: {
        category: {
          equals: categoryValue,
        },
      },
      limit: 6,
      sort: '-createdAt',
    },
    config,
  )

  return response.docs.map(toFeaturedArticleSummary)
}

export async function fetchTopViewedRealEstateNews(
  config?: AxiosRequestConfig,
): Promise<FeaturedArticleSummary[]> {
  const response = await payloadApi.find<RawFeaturedArticle>(
    'articles',
    {
      select: {
        title: true,
        excerpt: true,
        updatedAt: true,
        thumbnailUrl: true,
      },
      where: {
        and: [
          {
            category: {
              equals: 6,
            },
          },
          {
            status: {
              equals: 'published',
            },
          },
        ],
      },
      limit: 6,
      sort: '-viewCount',
    },
    config,
  )

  return response.docs.map(toFeaturedArticleSummary)
}

export const articlesService = {
  trackView: trackArticleView,
  fetchFeaturedByCategory: fetchFeaturedArticlesBasedOnCategoryId,
  fetchTopViewedRealEstateNews,
}
