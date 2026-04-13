import type { CollectionConfig } from 'payload'

import { ownerOrAdmin, adminOnly } from '@/access'

export const Vouchers: CollectionConfig = {
    slug: 'vouchers',
    admin: {
        useAsTitle: 'code',
        defaultColumns: ['code', 'user', 'discountType', 'status', 'expiresAt'],
    },
    access: {
        create: adminOnly,
        read: ownerOrAdmin('user'),
        update: adminOnly,
        delete: adminOnly,
    },
    fields: [
        {
            name: 'code',
            type: 'text',
            required: true,
            unique: true,
            maxLength: 50,
            admin: { description: 'Mã voucher (VD: VIP2024ABC)' },
        },
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            admin: { description: 'Thuộc về user nào' },
        },
        {
            name: 'discountType',
            type: 'select',
            required: true,
            options: [
                { label: 'Giảm cố định (VNĐ)', value: 'fixed' },
                { label: 'Giảm phần trăm (%)', value: 'percent' },
                { label: 'Miễn phí 1 lượt đăng', value: 'free_post' },
            ],
        },
        {
            name: 'discountValue',
            type: 'number',
            min: 0,
            admin: {
                description: 'Số tiền giảm hoặc % giảm',
                condition: (data) => data?.discountType !== 'free_post',
            },
        },
        {
            name: 'maxDiscount',
            type: 'number',
            min: 0,
            admin: {
                description: 'Giảm tối đa (VNĐ) — chỉ dùng cho giảm %',
                condition: (data) => data?.discountType === 'percent',
            },
        },
        {
            name: 'status',
            type: 'select',
            defaultValue: 'active',
            required: true,
            options: [
                { label: 'Còn hiệu lực', value: 'active' },
                { label: 'Đã sử dụng', value: 'used' },
                { label: 'Hết hạn', value: 'expired' },
            ],
        },
        {
            name: 'expiresAt',
            type: 'date',
            required: true,
            admin: { description: 'Ngày hết hạn' },
        },
        {
            name: 'usedAt',
            type: 'date',
            admin: {
                readOnly: true,
                condition: (data) => data?.status === 'used',
            },
        },
        {
            name: 'source',
            type: 'select',
            defaultValue: 'package',
            options: [
                { label: 'Tặng từ gói', value: 'package' },
                { label: 'Khuyến mãi', value: 'promotion' },
                { label: 'Admin tặng', value: 'admin' },
            ],
            admin: { description: 'Nguồn gốc voucher' },
        },
    ],
}