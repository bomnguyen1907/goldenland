'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { revalidatePath } from 'next/cache'

export type ProjectStatus = 'draft' | 'active' | 'hidden'
export type ProjectSaleStatus = 'active' | 'upcoming' | 'completed'

export type ProjectFormData = {
  name: string
  investorId?: number | null
  address?: string
  provinceCode?: string
  propertyTypes?: string[]
  totalArea?: number
  totalUnits?: number
  priceFrom?: number
  priceTo?: number
  startDate?: string
  completionDate?: string
  status: ProjectStatus
  saleStatus: ProjectSaleStatus
  isFeatured: boolean
  thumbnailId?: number | null
  videoUrl?: string
}

export async function saveProject(id: number | null, data: ProjectFormData) {
  const payload = await getPayload({ config: await config })
  const doc = {
    name: data.name,
    investor: data.investorId ?? undefined,
    address: data.address || undefined,
    provinceCode: data.provinceCode || undefined,
    propertyTypes: (data.propertyTypes ?? []) as any,
    totalArea: data.totalArea ?? undefined,
    totalUnits: data.totalUnits ?? undefined,
    priceFrom: data.priceFrom ?? undefined,
    priceTo: data.priceTo ?? undefined,
    startDate: data.startDate || undefined,
    completionDate: data.completionDate || undefined,
    status: data.status,
    saleStatus: data.saleStatus,
    isFeatured: data.isFeatured,
    thumbnail: data.thumbnailId ?? undefined,
    videoUrl: data.videoUrl || undefined,
  }
  if (id) {
    await payload.update({ collection: 'projects', id, data: doc, overrideAccess: true })
  } else {
    await payload.create({ collection: 'projects', data: doc, overrideAccess: true })
  }
  revalidatePath('/quan-tri/du-an')
}

export async function deleteProject(id: number) {
  const payload = await getPayload({ config: await config })
  await payload.delete({ collection: 'projects', id, overrideAccess: true })
  revalidatePath('/quan-tri/du-an')
}

export async function updateProjectStatus(id: number, status: ProjectStatus) {
  const payload = await getPayload({ config: await config })
  await payload.update({ collection: 'projects', id, data: { status }, overrideAccess: true })
  revalidatePath('/quan-tri/du-an')
}

export async function toggleProjectFeatured(id: number, isFeatured: boolean) {
  const payload = await getPayload({ config: await config })
  await payload.update({ collection: 'projects', id, data: { isFeatured }, overrideAccess: true })
  revalidatePath('/quan-tri/du-an')
}