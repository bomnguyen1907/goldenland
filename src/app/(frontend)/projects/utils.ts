export const PROPERTY_TYPES = [
    { label: 'Tất cả loại', value: '' },
    { label: 'Chung cư', value: 'apartment' },
    { label: 'Nhà riêng', value: 'house' },
    { label: 'Biệt thự', value: 'villa' },
    { label: 'Đất nền', value: 'land' },
    { label: 'Shophouse', value: 'shophouse' },
    { label: 'Condotel', value: 'condotel' },
]

export const STATUS_OPTIONS = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đang hiển thị', value: 'active' },
    { label: 'Nháp', value: 'draft' },
    { label: 'Tạm ẩn', value: 'hidden' },
]

export function formatPrice(p?: number): string {
    if (!p) return ''
    if (p >= 1000) return `${(p / 1000).toFixed(1)} tỷ`
    return `${p} triệu`
}

export function formatDate(d?: string): string {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('vi-VN')
}
