// @ts-nocheck
import type { Endpoint } from 'payload'

export const searchProperties: Endpoint = {
    path: '/search/properties',
    method: 'get',
    handler: async (req) => {
        const { payload } = req
        const query = req.query || {}

        const {
            keyword,
            listingType,
            propertyType,
            provinceCode,
            wardCode,
            minPrice,
            maxPrice,
            minArea,
            maxArea,
            bedrooms,
            direction,
            legalStatus,
            postType,
            page = '1',
            limit = '20',
            sort = '-createdAt',
        } = query

        // Build where clause
        const where: any = {
            and: [{ status: { equals: 'active' } }],
        }

        if (keyword) {
            where.and.push({
                or: [
                    { title: { like: keyword } },
                    { description: { like: keyword } },
                    { address: { like: keyword } },
                ],
            })
        }

        if (listingType) where.and.push({ listingType: { equals: listingType } })
        if (propertyType) where.and.push({ propertyType: { equals: propertyType } })
        if (provinceCode) where.and.push({ provinceCode: { equals: provinceCode } })
        if (wardCode) where.and.push({ wardCode: { equals: wardCode } })
        if (direction) where.and.push({ direction: { equals: direction } })
        if (legalStatus) where.and.push({ legalStatus: { equals: legalStatus } })
        if (postType) where.and.push({ postType: { equals: postType } })

        if (minPrice) where.and.push({ price: { greater_than_equal: Number(minPrice) } })
        if (maxPrice) where.and.push({ price: { less_than_equal: Number(maxPrice) } })
        if (minArea) where.and.push({ area: { greater_than_equal: Number(minArea) } })
        if (maxArea) where.and.push({ area: { less_than_equal: Number(maxArea) } })
        if (bedrooms) where.and.push({ bedrooms: { equals: Number(bedrooms) } })

        try {
            const result = await payload.find({
                collection: 'properties',
                where,
                page: Number(page),
                limit: Number(limit),
                sort: String(sort),
                depth: 2,
            })

            return Response.json({
                success: true,
                data: result.docs,
                pagination: {
                    page: result.page,
                    totalPages: result.totalPages,
                    totalDocs: result.totalDocs,
                    limit: result.limit,
                    hasNextPage: result.hasNextPage,
                    hasPrevPage: result.hasPrevPage,
                },
            })
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 })
        }
    },
}
