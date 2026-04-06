import type { CollectionConfig } from 'payload'

export const Banners: CollectionConfig = {
    slug: 'banners',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'position', 'isActive', 'startDate', 'endDate'],
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            maxLength: 255,
            admin: { description: 'Tên nội bộ để phân biệt (không hiển thị ngoài)' },
        },
        {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            required: true,
        },
        {
            name: 'link',
            type: 'text',
            maxLength: 500,
            admin: { description: 'URL khi click vào banner' },
        },
        {
            name: 'position',
            type: 'select',
            required: true,
            options: [
                { label: 'Trang chủ - Hero', value: 'home_hero' },
                { label: 'Trang chủ - Giữa', value: 'home_middle' },
                { label: 'Sidebar', value: 'sidebar' },
                { label: 'Danh sách tin', value: 'listing_list' },
                { label: 'Chi tiết tin', value: 'listing_detail' },
                { label: 'Popup', value: 'popup' },
            ],
        },
        {
            type: 'row',
            fields: [
                {
                    name: 'startDate',
                    type: 'date',
                    admin: { description: 'Bắt đầu hiển thị' },
                },
                {
                    name: 'endDate',
                    type: 'date',
                    admin: { description: 'Kết thúc hiển thị' },
                },
            ],
        },
        {
            name: 'sort',
            type: 'number',
            defaultValue: 0,
            admin: { description: 'Thứ tự (nhỏ → trước)' },
        },
        {
            name: 'isActive',
            type: 'checkbox',
            defaultValue: true,
        },
    ],
}