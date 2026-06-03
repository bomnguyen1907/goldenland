'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { revalidatePath } from 'next/cache'

export type BannerPosition =
  | 'home_hero'
  | 'home_middle'
  | 'sidebar'
  | 'listing_list'
  | 'listing_detail'
  | 'popup'

export type BannerFormData = {
  name: string
  imageId: number
  link?: string
  position: BannerPosition
  startDate?: string
  endDate?: string
  sort?: number
  isActive?: boolean
}

export async function saveBanner(id: number | null, data: BannerFormData) {
  const payload = await getPayload({ config: await config })
  if (id) {
    await payload.update({
      collection: 'banners',
      id,
      data: {
        name: data.name,
        image: data.imageId,
        link: data.link || undefined,
        position: data.position,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        sort: data.sort ?? 0,
        isActive: data.isActive ?? true,
      },
      overrideAccess: true,
    })
  } else {
    await payload.create({
      collection: 'banners',
      data: {
        name: data.name,
        image: data.imageId,
        link: data.link || undefined,
        position: data.position,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        sort: data.sort ?? 0,
        isActive: data.isActive ?? true,
      },
      overrideAccess: true,
    })
  }
  revalidatePath('/quan-tri/banner')
}

export async function deleteBanner(id: number) {
  const payload = await getPayload({ config: await config })
  await payload.delete({ collection: 'banners', id, overrideAccess: true })
  revalidatePath('/quan-tri/banner')
}

export async function toggleBannerActive(id: number, isActive: boolean) {
  const payload = await getPayload({ config: await config })
  await payload.update({
    collection: 'banners',
    id,
    data: { isActive },
    overrideAccess: true,
  })
  revalidatePath('/quan-tri/banner')
}