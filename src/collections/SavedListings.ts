// @ts-nocheck
import type { CollectionConfig } from 'payload'

export const SavedListings: CollectionConfig = {
    slug: 'saved-listings',
    admin: {
        defaultColumns: ['user', 'listing', 'createdAt'],
    },
    fields: [
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            index: true,
        },
        {
            name: 'listing',
            type: 'relationship',
            relationTo: 'listings',
            required: true,
        },
    ],
    hooks: {
        // Ngăn lưu trùng
        beforeChange: [
            async ({ data, operation, req }) => {
                if (operation === 'create' && data?.user && data?.listing) {
                    const existing = await req.payload.find({
                        collection: 'saved-listings',
                        where: {
                            user: { equals: data.user },
                            listing: { equals: data.listing },
                        },
                        limit: 1,
                    })
                    if (existing.docs.length > 0) {
                        throw new Error('Đã lưu tin này rồi')
                    }
                }
                return data
            },
        ],
    },
}