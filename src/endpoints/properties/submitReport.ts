import type { Endpoint } from 'payload'

const REPORT_REASONS = [
  'scam',
  'wrong_info',
  'duplicate',
  'wrong_image',
  'sold_not_removed',
  'other',
] as const

type ReportReason = (typeof REPORT_REASONS)[number]

const isReportReason = (value: unknown): value is ReportReason => {
  return typeof value === 'string' && REPORT_REASONS.includes(value as ReportReason)
}

const getRelationshipID = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }

  return ''
}

export const submitReport: Endpoint = {
  path: '/property-reports/submit',
  method: 'post',
  handler: async (req) => {
    const { payload, user } = req

    if (!user) {
      return Response.json({ error: 'Vui lòng đăng nhập để báo cáo tin đăng' }, { status: 401 })
    }

    try {
      const body = await req.json?.()
      const propertyId = body?.propertyId
      const reason = body?.reason
      const detail = typeof body?.detail === 'string' ? body.detail.trim() : ''

      if (!propertyId) {
        return Response.json({ error: 'Thiếu mã tin đăng' }, { status: 400 })
      }

      if (!isReportReason(reason)) {
        return Response.json({ error: 'Vui lòng chọn lý do báo cáo' }, { status: 400 })
      }

      if (reason === 'other' && detail.length < 10) {
        return Response.json(
          { error: 'Vui lòng mô tả chi tiết ít nhất 10 ký tự' },
          { status: 400 },
        )
      }

      const property = await payload.findByID({
        collection: 'properties',
        id: propertyId,
        depth: 0,
        overrideAccess: false,
        req,
      })

      const ownerID = getRelationshipID(property.user)

      if (ownerID && String(ownerID) === String(user.id)) {
        return Response.json(
          { error: 'Bạn không thể báo cáo tin đăng của chính mình' },
          { status: 400 },
        )
      }

      const existing = await payload.find({
        collection: 'reports',
        where: {
          and: [
            { property: { equals: propertyId } },
            { reporter: { equals: user.id } },
            { status: { in: ['pending', 'reviewing'] } },
          ],
        },
        limit: 1,
        overrideAccess: false,
        req,
      })

      if (existing.docs.length > 0) {
        return Response.json(
          { error: 'Bạn đã gửi báo cáo cho tin này. Chúng tôi đang xem xét.' },
          { status: 409 },
        )
      }

      await payload.create({
        collection: 'reports',
        data: {
          property: propertyId,
          reporter: user.id,
          reason,
          detail: detail ? detail.slice(0, 1000) : undefined,
          status: 'pending',
        },
        overrideAccess: false,
        req,
      })

      return Response.json({
        success: true,
        message: 'Đã gửi báo cáo. Cảm ơn bạn đã giúp chúng tôi kiểm duyệt tin đăng.',
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể gửi báo cáo'
      return Response.json({ error: message }, { status: 500 })
    }
  },
}
