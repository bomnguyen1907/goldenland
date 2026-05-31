'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { revalidatePath } from 'next/cache'

export async function toggleUserActive(id: number | string, isActive: boolean) {
  const payload = await getPayload({ config: await config })
  await payload.update({
    collection: 'users',
    id,
    data: { isActive },
    overrideAccess: true,
  })
  revalidatePath('/quan-tri/nguoi-dung')
}

export async function toggleUserVerified(id: number | string, isVerified: boolean) {
  const payload = await getPayload({ config: await config })
  await payload.update({
    collection: 'users',
    id,
    data: { isVerified },
    overrideAccess: true,
  })
  revalidatePath('/quan-tri/nguoi-dung')
}

export async function adjustBalance(id: number | string, amount: number) {
  const payload = await getPayload({ config: await config })
  const user = await payload.findByID({
    collection: 'users',
    id,
    overrideAccess: true,
  })
  const newBalance = Math.max(0, (user.balance || 0) + amount)
  await payload.update({
    collection: 'users',
    id,
    data: { balance: newBalance },
    overrideAccess: true,
  })
  revalidatePath('/quan-tri/nguoi-dung')
  return newBalance
}