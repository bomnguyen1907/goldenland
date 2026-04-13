import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access'

export const Contacts: CollectionConfig = {
    slug: 'contacts',
    admin: {
        useAsTitle: 'fullName',
        defaultColumns: ['fullName', 'phone', 'status', 'createdAt'],
    },
    access: {
        create: () => true,
        read: adminOnly,
        update: adminOnly,
        delete: adminOnly,
    },
    fields: [
        {
            name: 'fullName',
            type: 'text',
            required: true,
            maxLength: 150,
        },
        {
            name: 'email',
            type: 'email',
        },
        {
            name: 'phone',
            type: 'text',
            required: true,
            maxLength: 20,
        },
        {
            name: 'subject',
            type: 'text',
            maxLength: 255,
        },
        {
            name: 'message',
            type: 'textarea',
            required: true,
        },
        {
            name: 'status',
            type: 'select',
            defaultValue: 'new',
            options: [
                { label: 'Mới', value: 'new' },
                { label: 'Đã xem', value: 'read' },
                { label: 'Đã phản hồi', value: 'replied' },
            ],
        },
        {
            name: 'adminNote',
            type: 'textarea',
            admin: { description: 'Ghi chú nội bộ' },
        },
    ],
}