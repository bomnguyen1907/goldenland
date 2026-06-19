import type { AxiosRequestConfig } from 'axios'

import { postJSON } from '@/app/lib/api/http'

type MediaLike = {
  id?: string | number
  url?: string
}

export type MediaUploadResponse = MediaLike & {
  doc?: MediaLike
}

export type UploadedMedia = {
  id: number | null
  url: string | null
  raw: MediaUploadResponse
}

export async function uploadMedia(
  file: File,
  alt?: string,
  config?: AxiosRequestConfig,
): Promise<UploadedMedia> {
  const formData = new FormData()
  formData.append('file', file)
  if (alt) formData.append('alt', alt)

  const raw = await postJSON<MediaUploadResponse, FormData>('/api/media', formData, config)
  const doc = raw.doc ?? raw
  const mediaId = Number(doc.id)

  return {
    id: Number.isFinite(mediaId) && mediaId > 0 ? mediaId : null,
    url: typeof doc.url === 'string' ? doc.url : null,
    raw,
  }
}

export const mediaService = {
  upload: uploadMedia,
}
