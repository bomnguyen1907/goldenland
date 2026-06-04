export const PROPERTY_STATUS_OPTIONS = [
  { label: 'Nháp', value: 'draft' },
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Đang hiển thị', value: 'active' },
  { label: 'Hết hạn', value: 'expired' },
  { label: 'Đã bán', value: 'sold' },
  { label: 'Bị từ chối', value: 'rejected' },
] as const

export type PropertyStatusValue = (typeof PROPERTY_STATUS_OPTIONS)[number]['value']

export const PROPERTY_STATUS_LABELS: Record<PropertyStatusValue, string> =
  PROPERTY_STATUS_OPTIONS.reduce(
    (labels, option) => ({
      ...labels,
      [option.value]: option.label,
    }),
    {} as Record<PropertyStatusValue, string>,
  )
