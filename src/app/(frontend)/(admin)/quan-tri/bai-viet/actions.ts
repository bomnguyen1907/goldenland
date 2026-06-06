'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { revalidatePath } from 'next/cache'

export type ArticleStatus = 'draft' | 'published' | 'hidden'

export type ArticleFormData = {
  title: string
  excerpt?: string
  thumbnailUrl?: string
  categoryId?: number | null
  tags?: string
  isFeatured: boolean
  status: ArticleStatus
  publishedAt?: string
  authorId?: number | null
}

export async function saveArticle(id: number | null, data: ArticleFormData) {
  const payload = await getPayload({ config: await config })
  const doc = {
    title: data.title,
    excerpt: data.excerpt || undefined,
    thumbnailUrl: data.thumbnailUrl || undefined,
    category: data.categoryId ?? undefined,
    tags: data.tags || undefined,
    isFeatured: data.isFeatured,
    status: data.status,
    publishedAt: data.publishedAt || undefined,
    author: data.authorId ?? undefined,
  }
  if (id) {
    await payload.update({ collection: 'articles', id, data: doc, overrideAccess: true })
  } else {
    await payload.create({ collection: 'articles', data: doc as any, overrideAccess: true })
  }
  revalidatePath('/quan-tri/bai-viet')
}

export async function deleteArticle(id: number) {
  const payload = await getPayload({ config: await config })
  await payload.delete({ collection: 'articles', id, overrideAccess: true })
  revalidatePath('/quan-tri/bai-viet')
}

export async function updateArticleStatus(id: number, status: ArticleStatus) {
  const payload = await getPayload({ config: await config })
  const data: any = { status }
  if (status === 'published') data.publishedAt = new Date().toISOString()
  await payload.update({ collection: 'articles', id, data, overrideAccess: true })
  revalidatePath('/quan-tri/bai-viet')
}

export async function toggleArticleFeatured(id: number, isFeatured: boolean) {
  const payload = await getPayload({ config: await config })
  await payload.update({ collection: 'articles', id, data: { isFeatured }, overrideAccess: true })
  revalidatePath('/quan-tri/bai-viet')
}