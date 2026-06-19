import type { Project } from '@/payload-types'
import type { AxiosRequestConfig } from 'axios'

import { payloadApi } from '@/app/lib/api/payload'

export type ProjectOption = {
  id: string
  name: string
  provinceCode: string | null
  wardCode: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
}

export type ProjectsResponse = {
  data: Project[]
  page: number
  totalPages: number
  totalDocs: number
  hasMore: boolean
}

type ProjectOptionParams = {
  provinceCode?: string
  wardCode?: string
  limit?: number
}

const toProjectOption = (project: Project): ProjectOption => ({
  id: String(project.id),
  name: String(project.name || ''),
  provinceCode: typeof project.provinceCode === 'string' ? project.provinceCode : null,
  wardCode: typeof project.wardCode === 'string' ? project.wardCode : null,
  address: typeof project.address === 'string' ? project.address : null,
  latitude: typeof project.latitude === 'number' ? project.latitude : null,
  longitude: typeof project.longitude === 'number' ? project.longitude : null,
})

const buildProjectOptionWhere = ({ provinceCode, wardCode }: ProjectOptionParams) => {
  if (provinceCode && wardCode) {
    return {
      and: [
        { provinceCode: { equals: provinceCode } },
        { wardCode: { equals: wardCode } },
      ],
    }
  }

  if (provinceCode) {
    return {
      provinceCode: { equals: provinceCode },
    }
  }

  return undefined
}

export async function fetchProjectOptions(
  params: ProjectOptionParams = {},
  config?: AxiosRequestConfig,
): Promise<ProjectOption[]> {
  const response = await payloadApi.find<Project>(
    'projects',
    {
      depth: 0,
      limit: params.limit ?? 100,
      sort: 'name',
      where: buildProjectOptionWhere(params),
    },
    config,
  )

  return response.docs.map(toProjectOption)
}

export function fetchProjects(
  query: Record<string, unknown>,
  config?: AxiosRequestConfig,
) {
  return payloadApi.find<Project>('projects', query, config)
}

const toProjectsResponse = (response: Awaited<ReturnType<typeof fetchProjects>>): ProjectsResponse => ({
  data: response.docs,
  page: response.page ?? 1,
  totalPages: response.totalPages ?? 1,
  totalDocs: response.totalDocs ?? response.docs.length,
  hasMore: Boolean(response.hasNextPage),
})

export async function fetchFeaturedProjects(config?: AxiosRequestConfig): Promise<ProjectsResponse> {
  const response = await fetchProjects(
    {
      sort: '-views',
      limit: 4,
      page: 1,
      where: {
        status: {
          equals: 'active',
        },
      },
    },
    config,
  )

  return toProjectsResponse(response)
}

export async function fetchNewestProjects(config?: AxiosRequestConfig): Promise<ProjectsResponse> {
  const response = await fetchProjects(
    {
      sort: '-createdAt',
      limit: 7,
      page: 1,
      where: {
        status: {
          equals: 'active',
        },
      },
    },
    config,
  )

  return toProjectsResponse(response)
}

export function fetchProjectById(
  id: string | number,
  query?: Record<string, unknown>,
  config?: AxiosRequestConfig,
) {
  return payloadApi.findById<Project>('projects', id, query, config)
}

export function updateProject(
  id: string | number,
  data: Partial<Project> & Record<string, unknown>,
  config?: AxiosRequestConfig,
) {
  return payloadApi.update<Project, Partial<Project> & Record<string, unknown>>(
    'projects',
    id,
    data,
    config,
  )
}

export async function fetchRelatedProjects(project: Project, limit = 3) {
  if (!project.provinceCode) return []

  const response = await fetchProjects({
    limit,
    depth: 1,
    where: {
      and: [
        { provinceCode: { equals: project.provinceCode } },
        { id: { not_equals: project.id } },
      ],
    },
  })

  return response.docs
}

export const projectsService = {
  fetchOptions: fetchProjectOptions,
  fetchProjects,
  fetchFeatured: fetchFeaturedProjects,
  fetchNewest: fetchNewestProjects,
  fetchById: fetchProjectById,
  update: updateProject,
  fetchRelated: fetchRelatedProjects,
}
