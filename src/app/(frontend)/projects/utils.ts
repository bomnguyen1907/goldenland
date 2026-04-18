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

export function lexicalToHtml(content: any): string {
    if (!content?.root) return ''
    const processNode = (node: any): string => {
        if (node.type === 'text') {
            let t = node.text || ''
            if (node.format & 1) t = `<strong>${t}</strong>`
            if (node.format & 2) t = `<em>${t}</em>`
            if (node.format & 8) t = `<u>${t}</u>`
            return t
        }
        if (node.type === 'linebreak') return '<br>'
        const children = (node.children || []).map(processNode).join('')
        switch (node.type) {
            case 'paragraph': return `<p>${children || '<br>'}</p>`
            case 'heading': return `<h${node.tag}>${children}</h${node.tag}>`
            case 'list': return node.listType === 'bullet' ? `<ul>${children}</ul>` : `<ol>${children}</ol>`
            case 'listitem': return `<li>${children}</li>`
            case 'quote': return `<blockquote>${children}</blockquote>`
            case 'link': return `<a href="${node.url || '#'}">${children}</a>`
            default: return children
        }
    }
    return processNode(content.root)
}
