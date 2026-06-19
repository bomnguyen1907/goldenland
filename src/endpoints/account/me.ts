import { createClient } from '@supabase/supabase-js'
import type { Endpoint } from 'payload'
import sharp from 'sharp'

const AVATAR_BUCKET = 'Avatar'
const FALLBACK_SUPABASE_URL = 'https://ccwmekftdqxobmxscvzy.supabase.co'
const MAX_AVATAR_SIZE = 6 * 1024 * 1024

type FormDataFile = {
  arrayBuffer: () => Promise<ArrayBuffer>
  size: number
  type: string
}

const isFormDataFile = (value: FormDataEntryValue | null): value is File & FormDataFile => {
  if (!value || typeof value !== 'object') return false

  return (
    'arrayBuffer' in value &&
    typeof (value as FormDataFile).arrayBuffer === 'function' &&
    'size' in value &&
    typeof (value as FormDataFile).size === 'number' &&
    'type' in value &&
    typeof (value as FormDataFile).type === 'string'
  )
}

const cleanText = (value: unknown, maxLength: number): string | undefined => {
  if (typeof value !== 'string') return undefined
  const cleaned = value.trim().replace(/\s+/g, ' ').slice(0, maxLength)
  return cleaned || undefined
}

export const meProfile: Endpoint = {
  path: '/me/profile',
  method: 'get',
  handler: async (req) => {
    const { payload, user } = req

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const result = await payload.find({
        collection: 'profiles',
        where: { user: { equals: user.id } },
        limit: 1,
        overrideAccess: false,
        req,
      })

      const profile = result.docs[0] || null
      return Response.json({ profile })
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 })
    }
  },
}

export const updateMeProfile: Endpoint = {
  path: '/me/profile',
  method: 'patch',
  handler: async (req) => {
    const { payload, user } = req

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const body = (await req.json?.()) as
        | {
            fullName?: unknown
            phone?: unknown
            email?: unknown
            profile?: {
              displayName?: unknown
              address?: unknown
            }
          }
        | undefined

      const userData: Record<string, string> = {}
      const fullName = cleanText(body?.fullName, 150)
      const phone = cleanText(body?.phone, 20)
      const email = cleanText(body?.email, 320)

      if (fullName) userData.fullName = fullName
      if (phone) userData.phone = phone
      if (email) userData.email = email

      const updatedUser =
        Object.keys(userData).length > 0
          ? await payload.update({
              collection: 'users',
              id: user.id,
              data: userData,
              overrideAccess: false,
              req,
            })
          : user

      const profileResult = await payload.find({
        collection: 'profiles',
        where: { user: { equals: user.id } },
        limit: 1,
        overrideAccess: false,
        req,
      })
      const existingProfile = profileResult.docs[0]
      const profileData = {
        displayName: cleanText(body?.profile?.displayName, 150) || fullName,
        address: cleanText(body?.profile?.address, 500),
      }

      const profile = existingProfile
        ? await payload.update({
            collection: 'profiles',
            id: existingProfile.id,
            data: profileData,
            overrideAccess: false,
            req,
          })
        : await payload.create({
            collection: 'profiles',
            data: {
              user: user.id,
              displayName: profileData.displayName || fullName || user.email,
              address: profileData.address,
            },
            overrideAccess: true,
            req,
          })

      return Response.json({ user: updatedUser, profile })
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 })
    }
  },
}

export const uploadMyAvatar: Endpoint = {
  path: '/me/avatar',
  method: 'post',
  handler: async (req) => {
    const { payload, user } = req

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.SUPABASE_URL || FALLBACK_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseKey) {
      return Response.json({ error: 'Thiếu cấu hình Supabase Storage' }, { status: 500 })
    }

    try {
      if (!req.formData) {
        return Response.json({ error: 'Request không hỗ trợ multipart form data' }, { status: 400 })
      }

      const formData = await req.formData()
      const avatarFile = formData.get('avatar')

      if (!isFormDataFile(avatarFile)) {
        return Response.json({ error: 'Vui lòng chọn ảnh đại diện' }, { status: 400 })
      }

      if (!avatarFile.type.startsWith('image/')) {
        return Response.json({ error: 'File tải lên phải là hình ảnh' }, { status: 400 })
      }

      if (avatarFile.size > MAX_AVATAR_SIZE) {
        return Response.json({ error: 'Ảnh đại diện không được vượt quá 6MB' }, { status: 400 })
      }

      const arrayBuffer = await avatarFile.arrayBuffer()
      const jpegBuffer = await sharp(Buffer.from(arrayBuffer))
        .rotate()
        .resize(512, 512, { fit: 'cover' })
        .jpeg({ quality: 88 })
        .toBuffer()
      const filePath = `user-${user.id}/avatar.jpg`
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(filePath, jpegBuffer, {
        cacheControl: '0',
        contentType: 'image/jpeg',
        upsert: true,
      })

      if (error) {
        return Response.json({ error: error.message }, { status: 500 })
      }

      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath)
      const avatarUrl = data.publicUrl

      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          avatar_id: avatarUrl,
        },
        overrideAccess: false,
        req,
      })

      return Response.json({
        avatarUrl,
        displayAvatarUrl: `${avatarUrl}?v=${Date.now()}`,
      })
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 })
    }
  },
}

export const changeMyPassword: Endpoint = {
  path: '/me/change-password',
  method: 'post',
  handler: async (req) => {
    const { payload, user } = req

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const body = (await req.json?.()) as
        | {
            currentPassword?: unknown
            newPassword?: unknown
          }
        | undefined
      const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : ''
      const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''

      if (!currentPassword || !newPassword) {
        return Response.json({ error: 'Vui lòng nhập đầy đủ mật khẩu' }, { status: 400 })
      }

      if (newPassword.length < 8) {
        return Response.json({ error: 'Mật khẩu mới phải có tối thiểu 8 ký tự' }, { status: 400 })
      }

      if (!/[A-Z]/.test(newPassword)) {
        return Response.json({ error: 'Mật khẩu mới phải có ít nhất 1 ký tự viết hoa' }, { status: 400 })
      }

      if (!/[0-9]/.test(newPassword)) {
        return Response.json({ error: 'Mật khẩu mới phải có ít nhất 1 ký tự số' }, { status: 400 })
      }

      if (currentPassword === newPassword) {
        return Response.json({ error: 'Mật khẩu mới phải khác mật khẩu hiện tại' }, { status: 400 })
      }

      const email = typeof user.email === 'string' ? user.email : ''
      if (!email) {
        return Response.json({ error: 'Không tìm thấy email tài khoản' }, { status: 400 })
      }

      try {
        await payload.login({
          collection: 'users',
          data: {
            email,
            password: currentPassword,
          },
          overrideAccess: false,
          req,
        })
      } catch {
        return Response.json({ error: 'Mật khẩu hiện tại không đúng' }, { status: 400 })
      }

      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          password: newPassword,
        },
        overrideAccess: false,
        req,
      })

      return Response.json({ success: true })
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 })
    }
  },
}
