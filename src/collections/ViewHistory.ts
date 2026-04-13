import type { CollectionConfig } from 'payload'

import { ownerOrAdmin, adminOnly } from '@/access'

export const ViewHistory: CollectionConfig = {
    slug: 'view-history',
    admin: {
        defaultColumns: ['user', 'listing', 'createdAt'],
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
            name: 'listing',
            type: 'relationship',
            relationTo: 'listings',
            required: true,
        },
    ],
}