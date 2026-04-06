import type { CollectionConfig } from 'payload'

export const ViewHistory: CollectionConfig = {
    slug: 'view-history',
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
}