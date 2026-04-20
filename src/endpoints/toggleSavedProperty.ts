// @ts-nocheck
import type { Endpoint } from 'payload'

export const toggleSavedProperty: Endpoint = {
    path: '/saved-properties/toggle',
    method: 'post',
    handler: async (req) => {
        const { payload, user } = req

        if (!user) {
            return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 })
        }

        try {
            const body = await req.json?.()
            const { propertyId } = body || {}

            if (!propertyId) {
                return Response.json({ error: 'Thiếu propertyId' }, { status: 400 })
            }

            // Kiểm tra đã lưu chưa
            const existing = await payload.find({
                collection: 'saved-properties',
                where: {
                    and: [{ user: { equals: user.id } }, { property: { equals: propertyId } }],
                },
                limit: 1,
                overrideAccess: false,
                req,
            })

            if (existing.docs.length > 0) {
                // Đã lưu → bỏ lưu
                await payload.delete({
                    collection: 'saved-properties',
                    id: existing.docs[0].id,
                    overrideAccess: false,
                    req,
                })
                return Response.json({ success: true, saved: false, message: 'Đã bỏ lưu' })
            } else {
                // Chưa lưu → lưu
                await payload.create({
                    collection: 'saved-properties',
                    data: {
                        user: user.id,
                        property: propertyId,
                    },
                    overrideAccess: false,
                    req,
                })
                return Response.json({ success: true, saved: true, message: 'Đã lưu tin' })
            }
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 })
        }
    },
}
