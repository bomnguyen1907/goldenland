import type { Endpoint } from 'payload'

type SearchProjectsQuery = {
  keyword?: string
  district?: string
  page?: string
  limit?: string
  sort?: string
}

export const searchProjects: Endpoint = {
  path: '/search/projects',
  method: 'get',
  handler: async (req) => {
    const { payload } = req
    const query = (req.query || {}) as SearchProjectsQuery

    const {
      keyword,
      district,
      page = '1',
      limit = '20',
      sort = '-createdAt',
    } = query

    const where: any = {
      and: [{ status: { equals: 'active' } }],
    }

    if (keyword) {
      where.and.push({
        or: [
          { name: { like: keyword } },
          { address: { like: keyword } },
          { slug: { like: keyword } },
        ],
      })
    }

    if (district) {
      where.and.push({
        or: [
          { address: { like: `quận ${district}` } },
          { address: { like: `quan ${district}` } },
          { address: { like: `q.${district}` } },
          { address: { like: `q${district}` } },
        ],
      })
    }

    try {
      const result = await payload.find({
        collection: 'projects',
        where,
        page: Number(page),
        limit: Number(limit),
        sort: String(sort),
        depth: 1,
        overrideAccess: false,
        req,
      })

      return Response.json({
        success: true,
        data: result.docs,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          totalDocs: result.totalDocs,
          limit: result.limit,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
        },
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Project search failed'
      return Response.json({ error: message }, { status: 500 })
    }
  },
}
