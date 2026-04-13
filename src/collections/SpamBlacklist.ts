import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access'

export const SpamBlacklist: CollectionConfig = {
    slug: 'spam-blacklist',
    admin: {
        useAsTitle: 'value',
        defaultColumns: ['type', 'value', 'reason', 'createdAt'],
    },
    access: {
        create: adminOnly,
        read: adminOnly,
        update: adminOnly,
        delete: adminOnly,
    },
    fields: [
        {
            name: 'type',
            type: 'select',
            required: true,
            options: [
                { label: 'Số điện thoại', value: 'phone' },
                { label: 'Email', value: 'email' },
                { label: 'IP', value: 'ip' },
                { label: 'Từ khoá', value: 'keyword' },
            ],
        },
        {
            name: 'value',
            type: 'text',
            required: true,
            admin: { description: 'Giá trị bị chặn' },
        },
        {
            name: 'reason',
            type: 'textarea',
        },
        {
            name: 'isActive',
            type: 'checkbox',
            defaultValue: true,
        },
    ],
}