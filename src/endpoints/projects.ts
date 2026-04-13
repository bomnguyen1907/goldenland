import type { Endpoint } from 'payload'

export const projects: Endpoint = {
    path: '/projects',
    method: 'get',
    handler: async (req) => {
        const { payload } = req

        try {
            const projects = await payload.find({
                collection: 'projects',
                limit: 10,
                overrideAccess: false,
                req,
            })

            return Response.json({ projects: projects.docs })
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 })
        }
    },
}

export const projectDetail: Endpoint = {
    path: '/projects/:slug',
    method: 'get',
    handler: async (req) => {
        const { payload, routeParams } = req
        const slug = routeParams?.slug as string | undefined

        if (!slug) {
            return Response.json({ error: 'Thiếu slug dự án' }, { status: 400 })
        }

        try {
            const result = await payload.find({
                collection: 'projects',
                where: {
                    slug: {
                        equals: slug,
                    },
                },
                limit: 1,
                overrideAccess: false,
                req,
            })

            const project = result.docs[0]

            if (!project) {
                return Response.json({ error: 'Dự án không tồn tại' }, { status: 404 })
            }

            return Response.json({ project })
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 })
        }
    },
}

