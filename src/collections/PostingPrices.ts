import type { CollectionConfig } from 'payload'

import { activeOrAdmin, adminOnly } from '@/access'

export const PostingPrices: CollectionConfig = {
    slug: 'posting-prices',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'postType', 'durationDays', 'price', 'isActive'],
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
            admin: { description: 'VD: Tin thường 15 ngày, Tin VIP vàng 30 ngày' },
        },
        {
            name: 'postType',
            type: 'select',
            required: true,
            options: [
                { label: 'Tin thường', value: 'normal' },
                { label: 'VIP bạc', value: 'silver' },
                { label: 'VIP vàng', value: 'gold' },
                { label: 'VIP kim cương', value: 'diamond' },
            ],
        },
        {
            name: 'durationDays',
            type: 'number',
            required: true,
            min: 1,
            admin: { description: 'Số ngày hiển thị' },
        },
        {
            name: 'price',
            type: 'number',
            required: true,
            min: 0,
            admin: { description: 'Giá (VNĐ)' },
        },
        {
            name: 'sort',
            type: 'number',
            defaultValue: 0,
        },
        {
            name: 'isActive',
            type: 'checkbox',
            defaultValue: true,
        },
    ],
}
