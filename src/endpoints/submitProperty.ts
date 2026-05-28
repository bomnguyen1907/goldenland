import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import type { Endpoint } from 'payload'

const PROPERTIES_BUCKET = 'Properties'
const MIN_IMAGES = 3
const MAX_IMAGES = 10

type SubmitDraft = {
  provinceCode?: string
  wardCode?: string
  project?: string
  street?: string
  address?: string
  latitude?: number | null
  longitude?: number | null
  propertyType?: string
  area?: number
  price?: number
  legalStatus?: string
  furnitureStatus?: string
  direction?: string
  bedrooms?: number
  bathrooms?: number
  title?: string
  description?: string
  postType?: string
  durationDays?: number
  scheduledPublishAt?: string
}

type FormDataFile = {
  arrayBuffer: () => Promise<ArrayBuffer>
  type?: string
}

const isFormDataFile = (value: FormDataEntryValue): value is File & FormDataFile => {
  return typeof value === 'object' && value !== null && 'arrayBuffer' in value
}

const toNumberOrUndefined = (value: unknown): number | undefined => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : undefined
}

const toOptionalString = (value: unknown): string | undefined => {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

const toOptionalRelationshipID = (value: unknown): number | undefined => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : undefined
}

const POST_TYPE_OPTIONS = ['normal', 'silver', 'gold', 'diamond'] as const
type PostType = (typeof POST_TYPE_OPTIONS)[number]

const NORMAL_DURATIONS = [15, 30, 60]
const VIP_DURATIONS = [7, 15, 30]
const VIP_PACKAGE_IDS = new Set(['2', '3'])

const isPostType = (value: unknown): value is PostType => {
  return typeof value === 'string' && POST_TYPE_OPTIONS.includes(value as PostType)
}

const getRelationshipID = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }

  return ''
}

const startOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

const isSameLocalDate = (a: Date, b: Date) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const getScheduledPublishAt = (value: unknown, canUseScheduledHour: boolean) => {
  const now = new Date()

  if (typeof value !== 'string') return now

  const requested = new Date(value)
  if (Number.isNaN(requested.getTime()) || requested < now) return now
  if (canUseScheduledHour) return requested
  if (isSameLocalDate(requested, now)) return now

  return startOfDay(requested)
}

export const submitProperty: Endpoint = {
  path: '/post-flow/submit',
  method: 'post',
  handler: async (req) => {
    const { payload, user } = req

    if (!user) {
      return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Thiếu cấu hình Supabase Storage' }, { status: 500 })
    }

    try {
      if (!req.formData) {
        return Response.json({ error: 'Request không hỗ trợ multipart form data' }, { status: 400 })
      }

      const formData = await req.formData()
      const draftValue = formData.get('draft')

      if (typeof draftValue !== 'string') {
        return Response.json({ error: 'Thiếu dữ liệu tin đăng' }, { status: 400 })
      }

      const draft = JSON.parse(draftValue) as SubmitDraft
      const imageFiles = formData.getAll('images').filter(isFormDataFile)
      const postType = isPostType(draft.postType) ? draft.postType : 'normal'
      const isVipPost = postType !== 'normal'
      const allowedDurations = isVipPost ? VIP_DURATIONS : NORMAL_DURATIONS
      const requestedDuration = Number(draft.durationDays)
      const durationDays = allowedDurations.includes(requestedDuration)
        ? requestedDuration
        : 15

      const currentUser = await payload.findByID({
        collection: 'users',
        id: user.id,
        depth: 0,
        overrideAccess: false,
        req,
        select: {
          activePackage: true,
        },
      })
      const activePackageID = getRelationshipID(currentUser.activePackage)
      const canUseScheduledHour = isVipPost && VIP_PACKAGE_IDS.has(activePackageID)
      const scheduledPublishAt = getScheduledPublishAt(
        draft.scheduledPublishAt,
        canUseScheduledHour,
      )
      const expiresAt = new Date(scheduledPublishAt)
      expiresAt.setDate(expiresAt.getDate() + durationDays)
      const status = scheduledPublishAt > new Date() ? 'pending' : 'active'

      if (imageFiles.length < MIN_IMAGES) {
        return Response.json({ error: `Vui lòng tải lên tối thiểu ${MIN_IMAGES} ảnh` }, { status: 400 })
      }

      if (imageFiles.length > MAX_IMAGES) {
        return Response.json({ error: `Chỉ được tải lên tối đa ${MAX_IMAGES} ảnh` }, { status: 400 })
      }

      if (!draft.title?.trim() || !draft.description?.trim() || !draft.propertyType || !draft.price) {
        return Response.json({ error: 'Dữ liệu tin đăng chưa đầy đủ' }, { status: 400 })
      }

      const property = await payload.create({
        collection: 'properties',
        data: {
          title: draft.title.trim(),
          description: draft.description.trim(),
          propertyType: draft.propertyType,
          price: Number(draft.price),
          priceUnit: 'total',
          area: toNumberOrUndefined(draft.area),
          bedrooms: toNumberOrUndefined(draft.bedrooms),
          bathrooms: toNumberOrUndefined(draft.bathrooms),
          direction: toOptionalString(draft.direction),
          legalStatus: toOptionalString(draft.legalStatus),
          furnitureStatus: toOptionalString(draft.furnitureStatus),
          provinceCode: toOptionalString(draft.provinceCode),
          wardCode: toOptionalString(draft.wardCode),
          street: toOptionalString(draft.street),
          address: toOptionalString(draft.address),
          project: toOptionalRelationshipID(draft.project),
          latitude: typeof draft.latitude === 'number' ? draft.latitude : undefined,
          longitude: typeof draft.longitude === 'number' ? draft.longitude : undefined,
          postType,
          durationDays,
          scheduledPublishAt: scheduledPublishAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
          status,
          user: user.id,
        } as any,
        overrideAccess: false,
        req,
      })

      const supabase = createClient(supabaseUrl, supabaseKey)
      const uploadedPaths: string[] = []

      try {
        const images = await Promise.all(
          imageFiles.map(async (file, index) => {
            const arrayBuffer = await file.arrayBuffer()
            const jpegBuffer = await sharp(Buffer.from(arrayBuffer))
              .rotate()
              .jpeg({ quality: 88 })
              .toBuffer()
            const filePath = `property-${property.id}/${index + 1}.jpg`

            const { error } = await supabase.storage
              .from(PROPERTIES_BUCKET)
              .upload(filePath, jpegBuffer, {
                contentType: 'image/jpeg',
                upsert: true,
              })

            if (error) {
              throw new Error(error.message)
            }

            uploadedPaths.push(filePath)

            const { data } = supabase.storage.from(PROPERTIES_BUCKET).getPublicUrl(filePath)

            return {
              image: data.publicUrl,
              sort: index,
            }
          }),
        )

        const updatedProperty = await payload.update({
          collection: 'properties',
          id: property.id,
          data: { images },
          overrideAccess: false,
          req,
        })

        return Response.json({ property: updatedProperty })
      } catch (uploadError) {
        if (uploadedPaths.length > 0) {
          await supabase.storage.from(PROPERTIES_BUCKET).remove(uploadedPaths)
        }

        await payload.delete({
          collection: 'properties',
          id: property.id,
          overrideAccess: false,
          req,
        })

        throw uploadError
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể gửi tin đăng'
      return Response.json({ error: message }, { status: 500 })
    }
  },
}
