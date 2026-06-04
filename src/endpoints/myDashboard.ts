// @ts-nocheck
import type { Endpoint } from 'payload'
import { PROPERTY_STATUS_OPTIONS } from '@/lib/propertyStatus'

export const myDashboard: Endpoint = {
    path: '/my/dashboard',
    method: 'get',
    handler: async (req) => {
        const { payload, user } = req

        if (!user) {
            return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 })
        }

        try {
            // Đếm tin đăng của tôi theo status
            const statusCounts = await Promise.all(
                PROPERTY_STATUS_OPTIONS.map(async (status) => {
                    const result = await payload.find({
                        collection: 'properties',
                        where: {
                            and: [{ user: { equals: user.id } }, { status: { equals: status.value } }],
                        },
                        limit: 0,
                        overrideAccess: false,
                        req,
                    })

                    return [status.value, result.totalDocs] as const
                }),
            )
            const propertiesByStatus = Object.fromEntries(statusCounts)
            const totalProperties = Object.values(propertiesByStatus).reduce(
                (sum, count) => sum + Number(count || 0),
                0,
            )

            // Đếm voucher còn hiệu lực
            const vouchers = await payload.find({
                collection: 'vouchers',
                where: {
                    and: [{ user: { equals: user.id } }, { status: { equals: 'active' } }],
                },
                limit: 0,
                overrideAccess: false,
                req,
            })

            // Đếm tin yêu thích
            const favorites = await payload.find({
                collection: 'favorites',
                where: { user: { equals: user.id } },
                limit: 0,
                overrideAccess: false,
                req,
            })

            // Đếm thông báo chưa đọc
            const unreadNotifs = await payload.find({
                collection: 'notifications',
                where: {
                    and: [{ user: { equals: user.id } }, { isRead: { equals: false } }],
                },
                limit: 0,
                overrideAccess: false,
                req,
            })

            // 5 order gần nhất
            const recentOrders = await payload.find({
                collection: 'orders',
                where: { user: { equals: user.id } },
                sort: '-createdAt',
                limit: 5,
                overrideAccess: false,
                req,
            })

            return Response.json({
                balance: user.balance || 0,
                properties: {
                    ...propertiesByStatus,
                    drafts: propertiesByStatus.draft || 0,
                    total: totalProperties,
                },
                vouchersActive: vouchers.totalDocs,
                favoriteProperties: favorites.totalDocs,
                unreadNotifications: unreadNotifs.totalDocs,
                recentOrders: recentOrders.docs,
            })
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 })
        }
    },
}
