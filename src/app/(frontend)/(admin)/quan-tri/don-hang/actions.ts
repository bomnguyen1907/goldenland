'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { revalidatePath } from 'next/cache'

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded'

export async function updateOrderStatus(
  id: number | string,
  status: OrderStatus,
  adminNote?: string,
) {
  const payload = await getPayload({ config: await config })
  await payload.update({
    collection: 'orders',
    id,
    data: {
      status,
      ...(status === 'paid' ? { paidAt: new Date().toISOString() } : {}),
      ...(adminNote !== undefined ? { adminNote } : {}),
    },
    overrideAccess: true,
  })
  revalidatePath('/quan-tri/don-hang')
}