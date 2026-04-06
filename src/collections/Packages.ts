import type { CollectionConfig } from 'payload'

export const Packages: CollectionConfig = {
    slug: 'packages',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'price', 'totalListings', 'bonusVouchers', 'isActive'],
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            maxLength: 255,
            admin: { description: 'VD: Gói Cơ bản, Gói VIP, Gói Premium' },
        },
        {
            name: 'description',
            type: 'textarea',
        },
        {
            type: 'row',
            fields: [
                {
                    name: 'price',
                    type: 'number',
                    required: true,
                    min: 0,
                    admin: { description: 'Giá gói (VNĐ)' },
                },
                {
                    name: 'originalPrice',
                    type: 'number',
                    min: 0,
                    admin: { description: 'Giá gốc (hiển thị gạch ngang)' },
                },
            ],
        },
        {
            type: 'row',
            fields: [
                {
                    name: 'totalListings',
                    type: 'number',
                    required: true,
                    min: 1,
                    admin: { description: 'Số lượt đăng tin' },
                },
                {
                    name: 'durationDays',
                    type: 'number',
                    required: true,
                    min: 1,
                    admin: { description: 'Thời hạn gói (ngày)' },
                },
            ],
        },
        {
            name: 'listingDurationDays',
            type: 'number',
            required: true,
            min: 1,
            defaultValue: 30,
            admin: { description: 'Mỗi tin đăng hiển thị bao nhiêu ngày' },
        },
        {
            name: 'bonusVouchers',
            type: 'number',
            defaultValue: 0,
            admin: { description: 'Số voucher tặng kèm khi mua gói' },
        },
        {
            name: 'features',
            type: 'array',
            admin: { description: 'Danh sách tính năng gói' },
            fields: [
                {
                    name: 'feature',
                    type: 'text',
                    required: true,
                },
            ],
        },
        {
            name: 'postType',
            type: 'select',
            defaultValue: 'normal',
            options: [
                { label: 'Tin thường', value: 'normal' },
                { label: 'Tin VIP', value: 'vip' },
            ],
            admin: { description: 'Loại tin được đăng từ gói này' },
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