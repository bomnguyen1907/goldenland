import type { CollectionConfig } from 'payload'

import { activeOrAdmin, adminOnly } from '@/access'

export const ArticleCategories: CollectionConfig = {
    slug: 'article-categories',
    admin: {
        useAsTitle: 'name',
    },
    access: {
        create: adminOnly,
        read: activeOrAdmin('isActive'),
        update: adminOnly,
        delete: adminOnly,
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            maxLength: 100,
        },
        {
            name: 'slug',
            type: 'text',
            unique: true,
            maxLength: 150,
        },
        {
            name: 'description',
            type: 'textarea',
        },
        {
            name: 'thumbnail',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'isActive',
            type: 'checkbox',
            defaultValue: true,
        },
        {
            name: 'sort',
            type: 'number',
            defaultValue: 0,
            admin: { description: 'Thứ tự hiển thị (nhỏ → trước)' },
        },
    ],
    hooks: {
        beforeChange: [
            ({ data }) => {
                if (data?.name && !data?.slug) {
                    data.slug = data.name
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/đ/g, 'd')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')
                }
                return data
            },
        ],
    },
}