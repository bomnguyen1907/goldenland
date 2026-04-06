import type { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
    slug: 'notifications',
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'user', 'type', 'isRead', 'createdAt'],
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
            name: 'title',
            type: 'text',
            required: true,
            maxLength: 255,
        },
        {
            name: 'message',
            type: 'textarea',
            required: true,
        },
        {
            name: 'type',
            type: 'select',
            required: true,
            options: [
                { label: 'Hệ thống', value: 'system' },
                { label: 'Tin đăng', value: 'listing' },
                { label: 'Thanh toán', value: 'payment' },
                { label: 'Khuyến mãi', value: 'promotion' },
                { label: 'Xác thực', value: 'verification' },
            ],
        },
        {
            name: 'referenceType',
            type: 'select',
            options: [
                { label: 'Listing', value: 'listing' },
                { label: 'Order', value: 'order' },
                { label: 'Voucher', value: 'voucher' },
                { label: 'Article', value: 'article' },
            ],
            admin: { description: 'Loại đối tượng liên quan' },
        },
        {
            name: 'referenceId',
            type: 'number',
            admin: { description: 'ID đối tượng liên quan' },
        },
        {
            name: 'isRead',
            type: 'checkbox',
            defaultValue: false,
        },
    ],
}