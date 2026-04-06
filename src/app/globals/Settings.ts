import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
    slug: 'settings',
    admin: {
        description: 'Cấu hình chung của hệ thống',
    },
    fields: [
        {
            type: 'tabs',
            tabs: [
                {
                    label: 'Thông tin website',
                    fields: [
                        {
                            name: 'siteName',
                            type: 'text',
                            defaultValue: 'BĐS Việt Nam',
                        },
                        {
                            name: 'siteDescription',
                            type: 'textarea',
                        },
                        {
                            name: 'logo',
                            type: 'upload',
                            relationTo: 'media',
                        },
                        {
                            name: 'contactEmail',
                            type: 'email',
                        },
                        {
                            name: 'contactPhone',
                            type: 'text',
                        },
                        {
                            name: 'address',
                            type: 'text',
                        },
                    ],
                },
                {
                    label: 'Mạng xã hội',
                    fields: [
                        {
                            name: 'facebook',
                            type: 'text',
                        },
                        {
                            name: 'youtube',
                            type: 'text',
                        },
                        {
                            name: 'zalo',
                            type: 'text',
                        },
                        {
                            name: 'tiktok',
                            type: 'text',
                        },
                    ],
                },
                {
                    label: 'SEO mặc định',
                    fields: [
                        {
                            name: 'defaultSeoTitle',
                            type: 'text',
                            maxLength: 70,
                        },
                        {
                            name: 'defaultSeoDescription',
                            type: 'textarea',
                            maxLength: 160,
                        },
                        {
                            name: 'defaultOgImage',
                            type: 'upload',
                            relationTo: 'media',
                        },
                    ],
                },
            ],
        },
    ],
}