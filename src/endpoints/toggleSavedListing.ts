// @ts-nocheck
import type { Endpoint } from 'payload'

export const toggleSavedListing: Endpoint = {
    path: '/saved-listings/toggle',
    method: 'post',
    handler: async (req) => {
        const { payload, user } = req

        if (!user) {
            return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 })
        }

        try {
            const body = await req.json?.()
            const { listingId } = body || {}

            if (!listingId) {
                return Response.json({ error: 'Thiếu listingId' }, { status: 400 })
            }

            // Kiểm tra đã lưu chưa
            const existing = await payload.find({
                collection: 'saved-listings',
                where: {
                    and: [{ user: { equals: user.id } }, { listing: { equals: listingId } }],
                },
                limit: 1,
            })

            if (existing.docs.length > 0) {
                // Đã lưu → bỏ lưu
                await payload.delete({
                    collection: 'saved-listings',
                    id: existing.docs[0].id,
                })
                return Response.json({ success: true, saved: false, message: 'Đã bỏ lưu' })
            } else {
                // Chưa lưu → lưu
                await payload.create({
                    collection: 'saved-listings',
                    data: {
                        user: user.id,
                        listing: listingId,
                    },
                })
                return Response.json({ success: true, saved: true, message: 'Đã lưu tin' })
            }
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 })
        }
    },
}