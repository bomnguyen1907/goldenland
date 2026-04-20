// @ts-nocheck
import type { CollectionConfig } from 'payload'

import { ownerOrAdmin, adminOnly } from '@/access'

export const SavedProperties: CollectionConfig = {
    slug: 'saved-properties',
    admin: {
        defaultColumns: ['user', 'property', 'createdAt'],
    },
    access: {
        create: ownerOrAdmin('user'),
        read: ownerOrAdmin('user'),
        update: adminOnly,
        delete: ownerOrAdmin('user'),
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
            name: 'property',
            type: 'relationship',
            relationTo: 'properties',
            required: true,
        },
    ],
    hooks: {
        // Ngăn lưu trùng
        beforeChange: [
            async ({ data, operation, req }) => {
                if (operation === 'create' && data?.user && data?.property) {
                    const existing = await req.payload.find({
                        collection: 'saved-properties',
                        where: {
                            user: { equals: data.user },
                            property: { equals: data.property },
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
