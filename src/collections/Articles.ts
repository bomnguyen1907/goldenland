import type { CollectionConfig } from 'payload'

import { authenticated, ownerOrAdmin, statusOrOwnerOrAdmin } from '@/access'

export const Articles: CollectionConfig = {
    slug: 'articles',
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'category', 'status', 'author', 'createdAt'],
    },
    endpoints: [
        {
            path: '/:id/view',
            method: 'post',
            handler: async (req) => {
                const id = req.routeParams?.id as string;
                try {
                    const article = await req.payload.findByID({
                        collection: 'articles',
                        id: id as string,
                        depth: 0,
                    });

                    await req.payload.update({
                        collection: 'articles',
                        id: id as string,
                        data: {
                            viewCount: (article.viewCount || 0) + 1,
                        },
                        req, // Maintain transaction safety
                    });

                    return Response.json({ success: true, viewCount: (article.viewCount || 0) + 1 });
                } catch (error) {
                    return Response.json({ error: 'Article not found' }, { status: 404 });
                }
            },
        },
    ],
    access: {
        create: authenticated,
        read: statusOrOwnerOrAdmin('status', 'published', 'author'),
        update: ownerOrAdmin('author'),
        delete: ownerOrAdmin('author'),
    },
    fields: [
        {
            type: 'tabs',
            tabs: [
                // ============================
                // TAB 1: Nội dung
                // ============================
                {
                    label: 'Nội dung',
                    fields: [
                        {
                            name: 'title',
                            type: 'text',
                            required: true,
                            maxLength: 255,
                        },
                        {
                            name: 'slug',
                            type: 'text',
                            unique: true,
                            maxLength: 300,
                        },
                        {
                            name: 'excerpt',
                            type: 'textarea',
                            maxLength: 500,
                            admin: { description: 'Mô tả ngắn hiển thị ở danh sách' },
                        },
                        {
                            name: 'content',
                            type: 'richText',
                            required: true,
                        },
                        {
                            name: 'thumbnailUrl',
                            type: 'text',
                            admin: { description: 'URL Ảnh đại diện bài viết từ Supabase' },
                        },
                    ],
                },

                // ============================
                // TAB 2: Phân loại
                // ============================
                {
                    label: 'Phân loại',
                    fields: [
                        {
                            name: 'category',
                            type: 'relationship',
                            relationTo: 'article-categories',
                            required: true,
                        },
                        {
                            name: 'tags',
                            type: 'text',
                            admin: { description: 'Nhập tags cách nhau bởi dấu phẩy' },
                        },
                        {
                            name: 'isFeatured',
                            type: 'checkbox',
                            defaultValue: false,
                            admin: { description: 'Bài viết nổi bật' },
                        },
                    ],
                },

                // ============================
                // TAB 3: SEO
                // ============================
                {
                    label: 'SEO',
                    fields: [
                        {
                            name: 'seoTitle',
                            type: 'text',
                            maxLength: 70,
                        },
                        {
                            name: 'seoDescription',
                            type: 'textarea',
                            maxLength: 160,
                        },
                        {
                            name: 'seoKeywords',
                            type: 'text',
                        },
                    ],
                },
            ],
        },

        // ============================
        // Sidebar
        // ============================
        {
            name: 'author',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            admin: {
                position: 'sidebar',
                description: 'Người viết',
            },
        },
        {
            name: 'status',
            type: 'select',
            defaultValue: 'draft',
            required: true,
            options: [
                { label: 'Nháp', value: 'draft' },
                { label: 'Đang hiển thị', value: 'published' },
                { label: 'Tạm ẩn', value: 'hidden' },
            ],
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'publishedAt',
            type: 'date',
            admin: {
                position: 'sidebar',
                description: 'Ngày xuất bản',
                condition: (data) => data?.status === 'published',
            },
        },
        {
            name: 'viewCount',
            type: 'number',
            defaultValue: 0,
            admin: {
                position: 'sidebar',
                description: 'Lượt xem',
                readOnly: true,
            },
        },
    ],

    hooks: {
        beforeChange: [
            ({ data }) => {
                // Tự sinh slug
                if (data?.title && !data?.slug) {
                    data.slug = data.title
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/đ/g, 'd')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')
                }
                // Tự set publishedAt khi publish lần đầu
                if (data?.status === 'published' && !data?.publishedAt) {
                    data.publishedAt = new Date().toISOString()
                }
                return data
            },
        ],
    },
}