import type { CollectionConfig } from 'payload'

export const PostingPrices: CollectionConfig = {
    slug: 'posting-prices',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'postType', 'durationDays', 'price', 'isActive'],
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            admin: { description: 'VD: Tin thường 7 ngày, Tin VIP 30 ngày' },
        },
        {
            name: 'postType',
            type: 'select',
            required: true,
            options: [
                { label: 'Tin thường', value: 'normal' },
                { label: 'Tin VIP', value: 'vip' },
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